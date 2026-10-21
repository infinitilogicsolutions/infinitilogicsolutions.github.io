// Restore cached identity immediately; load Google only after an explicit request.
(function bootstrapSignIn(){
 const ns=window.InfinitiVisitor;if(!ns)return;
  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function decodeJwt(credential) {
    try {
      const parts = credential.split('.');

      if (parts.length < 2) {
        return null;
      }

      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
      const json = atob(payload);

      return JSON.parse(json);
    } catch (error) {
      console.error('Failed to decode Google One Tap credential:', error);
      return null;
    }
  }

  function buildIdentityProfile(tokenPayload) {
    const fullName = tokenPayload.name || [tokenPayload.given_name, tokenPayload.family_name].filter(Boolean).join(' ');

    return {
      googleName: fullName || '',
      googleEmail: tokenPayload.email || '',
      googlePhotoUrl: tokenPayload.picture || '',
      googleSubId: tokenPayload.sub || '',
      consentTimestamp: new Date().toISOString()
    };
  }


 let sdkPromise,initialized=false,dialog;
 function getDialog(){
  if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.className='signin-dialog';dialog.setAttribute('aria-labelledby','signin-heading');
  dialog.innerHTML='<h2 id="signin-heading">Personalize your visit</h2><p>Your tools work without signing in. Continue with Google to personalize your profile.</p><p role="status" data-signin-status></p><div data-google-button></div><button type="button" data-close-signin>Close</button>';
  dialog.querySelector('[data-close-signin]').addEventListener('click',()=>dialog.close());
  document.body.appendChild(dialog);return dialog;
 }
 function loadGoogleScript(){
  if(window.google?.accounts?.id)return Promise.resolve();
  if(sdkPromise)return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.dataset.googleOneTap='true';
   script.onload=resolve;script.onerror=()=>{script.remove();sdkPromise=null;reject(new Error('Google sign-in could not load.'))};
   document.head.appendChild(script);
  });return sdkPromise;
 }
 async function requestSignIn(){
  const view=getDialog(),status=view.querySelector('[data-signin-status]');
  if(!view.open)view.showModal();
  if(!ns.config.oneTapEnabled||!ns.config.googleClientId){status.textContent='Sign-in is unavailable. You can keep using the site.';return}
  if(ns.getState('identity')?.googleSubId){status.textContent='You are already signed in.';return}
  status.textContent='Loading Google sign-in…';
  try{
   await loadGoogleScript();
   if(!initialized){
    window.google.accounts.id.initialize({client_id:ns.config.googleClientId,auto_select:false,callback(response){
     const payload=decodeJwt(response.credential||'');if(!payload){status.textContent='Google returned an invalid response. Please try again.';return}
     const identity=buildIdentityProfile(payload);writeStorage(ns.storageKeys.googleProfile,JSON.stringify(identity));ns.setState('identity',identity,ns.events.identityReady);view.close();
    }});initialized=true;
   }
   const host=view.querySelector('[data-google-button]');host.replaceChildren();
   window.google.accounts.id.renderButton(host,{theme:'outline',size:'large',text:'continue_with',width:280});status.textContent='';
  }catch(error){status.textContent='Google sign-in is unavailable right now. Close this dialog and try again later.';}
 }
 ns.requestSignIn=requestSignIn;
 const cached=ns.parseJson(readStorage(ns.storageKeys.googleProfile,''),null);
 if(cached?.googleSubId)ns.setState('identity',cached,ns.events.identityReady);
 document.addEventListener('click',event=>{if(event.target.closest?.('[data-request-signin]'))requestSignIn()});
})();
