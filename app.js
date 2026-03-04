let model=null;
const video=document.getElementById('video');
const startBtn=document.getElementById('start-btn');
const stopBtn=document.getElementById('stop-btn');
const captureBtn=document.getElementById('capture-btn');
const resultEl=document.getElementById('result');
const canvas=document.getElementById('capture-canvas');
const historyList=document.getElementById('history-list');
const clearHistory=document.getElementById('clear-history');

const navScan=document.getElementById('nav-scan');
const navHistory=document.getElementById('nav-history');
const navEdu=document.getElementById('nav-edu');
const scanSection=document.getElementById('scan-section');
const historySection=document.getElementById('history-section');
const eduSection=document.getElementById('edu-section');

let stream=null;

function showPanel(panel){
  scanSection.classList.add('hidden');
  historySection.classList.add('hidden');
  eduSection.classList.add('hidden');
  panel.classList.remove('hidden');
}

navScan.addEventListener('click',()=>{showPanel(scanSection); setActive(navScan)});
navHistory.addEventListener('click',()=>{showPanel(historySection); setActive(navHistory); renderHistory()});
navEdu.addEventListener('click',()=>{showPanel(eduSection); setActive(navEdu)});

function setActive(btn){document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active')}

async function loadModel(){
  resultEl.textContent='Memuat model...';
  try{
    model=await mobilenet.load();
    resultEl.textContent='Model siap. Mulai kamera.';
    captureBtn.disabled=false;
  }catch(e){
    resultEl.textContent='Gagal memuat model';
    console.error(e);
  }
}

async function startCamera(){
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}, audio:false});
    video.srcObject=stream;
    await video.play();
    startBtn.disabled=true;
    stopBtn.disabled=false;
    captureBtn.disabled=false;
    resultEl.textContent='Kamera aktif.';
  }catch(e){
    console.error(e);
    resultEl.textContent='Tidak dapat mengakses kamera.';
  }
}

function stopCamera(){
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    stream=null;
  }
  video.pause();
  video.srcObject=null;
  startBtn.disabled=false;
  stopBtn.disabled=true;
  captureBtn.disabled=true;
  resultEl.textContent='Kamera dihentikan.';
}

async function captureAndClassify(){
  if(!model){ resultEl.textContent='Model belum siap'; return }
  // draw video to canvas
  canvas.width=video.videoWidth||640;
  canvas.height=video.videoHeight||480;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  // classify using model.classify which accepts an image/video/canvas
  resultEl.textContent='Menganalisis...';
  try{
    const predictions=await model.classify(canvas);
    if(predictions && predictions.length>0){
      const top=predictions[0];
      resultEl.innerHTML=`${top.className} — ${(top.probability*100).toFixed(1)}%`;
      // save to history
      const dataUrl=canvas.toDataURL('image/jpeg',0.8);
      addHistory({label:top.className,score:top.probability,ts:Date.now(),image:dataUrl});
    }else{
      resultEl.textContent='Tidak ada prediksi.';
    }
  }catch(e){
    console.error(e);
    resultEl.textContent='Error saat menganalisis';
  }
}

function loadHistory(){
  try{
    const raw=localStorage.getItem('eco_history');
    return raw?JSON.parse(raw):[];
  }catch(e){return[]}
}

function saveHistory(arr){
  localStorage.setItem('eco_history',JSON.stringify(arr));
}

function addHistory(item){
  const arr=loadHistory();
  arr.unshift(item);
  if(arr.length>50) arr.pop();
  saveHistory(arr);
  renderHistory();
}

function renderHistory(){
  const arr=loadHistory();
  historyList.innerHTML='';
  if(arr.length===0){
    historyList.innerHTML='<li style="padding:12px;color:#666">Belum ada history.</li>';
    return;
  }
  arr.forEach(h=>{
    const li=document.createElement('li');
    const img=document.createElement('img'); img.src=h.image;
    const meta=document.createElement('div');
    meta.innerHTML=`<div style="font-weight:600">${h.label}</div><div style="color:#666;font-size:0.9rem">${new Date(h.ts).toLocaleString()} — ${(h.score*100).toFixed(1)}%</div>`;
    li.appendChild(img); li.appendChild(meta);
    historyList.appendChild(li);
  });
}

clearHistory.addEventListener('click',()=>{localStorage.removeItem('eco_history'); renderHistory();});

startBtn.addEventListener('click',startCamera);
stopBtn.addEventListener('click',stopCamera);
captureBtn.addEventListener('click',captureAndClassify);

// Init
loadModel();
renderHistory();

// Optional: handle page visibility to stop camera when hidden
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) stopCamera();
});