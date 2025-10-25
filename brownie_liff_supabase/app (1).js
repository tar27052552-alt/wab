// app.js - LINE LIFF login + Supabase (login-only screen)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://dyorwbjagjlkqpbrdjwk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5b3J3YmphZ2psa3FwYnJkandrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNjk2NjgsImV4cCI6MjA3Njk0NTY2OH0.bZJRcaM3u9NUBrux5AbPXOXVtcSnJHDdK15gCQ-9Zc4";
const LIFF_ID = "2008357926-Ly07A5w2";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements
const btnCenter = document.getElementById("btn-login-center");
const modal = document.getElementById("phone-modal");
const phoneInput = document.getElementById("phone-input");
const phoneSave = document.getElementById("phone-save");
const phoneCancel = document.getElementById("phone-cancel");

const H_ID = document.getElementById("currentUserId");
const H_NAME = document.getElementById("currentUserName");
const H_AVA = document.getElementById("currentUserAvatar");

let lineProfile = null;

function showModal(show=true){ if(!modal) return; modal.classList[show?'remove':'add']('hidden'); }

function setUserState(profile){
  if (!profile){ window.LINE_USER=null; H_ID.value=H_NAME.value=H_AVA.value=''; localStorage.removeItem('lineUser'); return; }
  const user = { userId: profile.userId, displayName: profile.displayName||'', pictureUrl: profile.pictureUrl||'' };
  window.LINE_USER = user;
  H_ID.value = user.userId; H_NAME.value = user.displayName; H_AVA.value = user.pictureUrl;
  localStorage.setItem('lineUser', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('line-login', { detail: user }));
}

async function ensureCustomerRow(profile) {
  try {
    const { data } = await supabase.from("customers").select("id, phone").eq("user_id", profile.userId).maybeSingle();
    if (!data) {
      await supabase.from("customers").insert({ user_id: profile.userId, display_name: profile.displayName ?? "User" });
      return { phone: null };
    }
    return data;
  } catch (e) {
    console.warn("ensureCustomerRow error:", e);
    return null;
  }
}

async function requirePhoneIfMissing(){
  try{
    const { data } = await supabase.from("customers").select("phone").eq("user_id", lineProfile.userId).maybeSingle();
    if (!data || !data.phone){
      showModal(true);
      return await new Promise((resolve)=>{
        async function onSave(){
          const val = (phoneInput.value||'').trim();
          if (!/^\d{9,10}$/.test(val)){ phoneInput.focus(); phoneInput.reportValidity?.(); return; }
          await supabase.from("customers").update({ phone: val }).eq("user_id", lineProfile.userId);
          cleanup(); resolve();
        }
        function onCancel(){ cleanup(); resolve(); }
        function cleanup(){
          showModal(false);
          phoneSave.removeEventListener('click', onSave);
          phoneInput.removeEventListener('keydown', onEnter);
          phoneCancel.removeEventListener('click', onCancel);
        }
        function onEnter(e){ if(e.key==='Enter') onSave(); }
        phoneSave.addEventListener('click', onSave);
        phoneCancel.addEventListener('click', onCancel);
        phoneInput.addEventListener('keydown', onEnter);
      });
    }
  }catch(e){ console.warn(e); }
}

async function afterLogin(){
  lineProfile = await liff.getProfile();
  setUserState(lineProfile);
  const info = await ensureCustomerRow(lineProfile);
  await requirePhoneIfMissing();
  // TODO: navigate to your shop page if needed, e.g., window.location.href = '/shop.html'
}

async function initLIFF(){
  await liff.init({ liffId: LIFF_ID });
  if (!liff.isLoggedIn()) return;
  await afterLogin();
}

btnCenter && btnCenter.addEventListener('click', () => liff.login({}));

// Boot
initLIFF();
// Recover if already saved (for reload inside LIFF)
try { const saved = localStorage.getItem('lineUser'); if (saved) setUserState(JSON.parse(saved)); } catch {}
