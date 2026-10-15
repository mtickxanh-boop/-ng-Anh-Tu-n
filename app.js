(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const storageKey = "pixora.posts.v1";
  const today = new Date();
  const isoDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const dateLabel = value => new Date(`${value || isoDate(today)}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  const fmt = n => {
    n = Number(n || 0);
    if (n >= 1_000_000) return (n/1_000_000).toFixed(n>=10_000_000?0:1).replace(".0","")+"M";
    if (n >= 1000) return (n/1000).toFixed(n>=10_000?0:1).replace(".0","")+"K";
    return String(n);
  };
  const samplePosts = [
    {id:"sample-1",author:"luna.photo",date:"2026-10-14",caption:"Just another beautiful day in the mountains 🏔️\nNature always finds a way to make you feel alive. 💙\n#nature #mountains #travel #photography",topic:"Nature",image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85",likes:1200,views:8500,comments:48,shares:120,showLikes:true,showViews:true,visibility:"Public",archived:true,liked:false,saved:false},
    {id:"sample-2",author:"minhtrang",date:"2026-10-12",caption:"Good food, good mood! 🍜\nLife is better when you eat well. 😋\n#food #delicious #foodie",topic:"Food",image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=85",likes:980,views:6200,comments:32,shares:64,showLikes:true,showViews:true,visibility:"Public",archived:true,liked:false,saved:false},
    {id:"sample-3",author:"ducanh",date:"2025-04-15",caption:"City lights and late night walks ✨ #city #travel",topic:"City",image:"https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=85",likes:2400,views:15400,comments:91,shares:210,showLikes:true,showViews:true,visibility:"Public",archived:true,liked:false,saved:false},
    {id:"sample-4",author:"hoang2407",date:"2024-08-21",caption:"Tiny paws, big personality 🐈 #animals #cat",topic:"Animals",image:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=85",likes:810,views:8100,comments:24,shares:42,showLikes:true,showViews:true,visibility:"Public",archived:true,liked:false,saved:false},
    {id:"sample-5",author:"phuonganh",date:"2023-06-03",caption:"Ocean air, clear mind. 🌊 #travel #nature",topic:"Travel",image:"https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=85",likes:760,views:7600,comments:17,shares:36,showLikes:true,showViews:true,visibility:"Public",archived:true,liked:false,saved:false},
    {id:"sample-6",author:"xanh tick",date:"2025-01-07",caption:"A quiet road through the green. 🌲 #nature #photography",topic:"Nature",image:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=85",likes:540,views:4200,comments:15,shares:28,showLikes:true,showViews:true,visibility:"Public",archived:true,liked:false,saved:false}
  ];
  let posts = loadPosts();
  let chosenFiles = [];
  let activeView = "home";
  let activeFilter = "All";
  let searchTerm = "";

  function loadPosts() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : samplePosts.map(p=>({...p}));
    } catch { return samplePosts.map(p=>({...p})); }
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(posts)); }
    catch { toast("Browser storage is full. Try using fewer or smaller photos."); }
  }
  function escapeHTML(s="") {
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function toast(message) {
    const el=$("#toast"); el.textContent=message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2400);
  }
  function go(view) {
    activeView=view;
    $$(".view").forEach(el=>el.classList.toggle("hidden",el.id!==`view-${view}`));
    $$(".nav-item").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
    $$(".mobile-nav [data-view]").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
    if(view==="home") renderFeed();
    if(view==="explore") renderExplore();
    if(view==="archive") renderArchive();
    if(view==="profile") renderProfile();
    if(view==="saved") renderSaved();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function metricMarkup(p) {
    return `<div class="post-metrics">
      ${p.showLikes!==false?`<div class="metric-pill"><span>♡</span><b>${fmt(p.likes)}</b><span>likes</span></div>`:""}
      ${p.showViews!==false?`<div class="metric-pill"><span>◉</span><b>${fmt(p.views)}</b><span>views</span></div>`:""}
      <div class="metric-pill"><span>▢</span><b>${fmt(p.comments)}</b><span>comments</span></div>
    </div>`;
  }
  function postMarkup(p) {
    const caption = escapeHTML(p.caption).replace(/(#[\w]+)/g,'<span class="hashtag">$1</span>');
    return `<article class="card post-card" data-post-id="${escapeHTML(p.id)}">
      <div class="post-top"><div class="profile-bubble">${escapeHTML((p.author||"U").slice(0,1).toUpperCase())}</div><div><div class="post-author">${escapeHTML(p.author||"Unknown")}</div><div class="post-time">${dateLabel(p.date)} · ${escapeHTML(p.visibility||"Public")}</div></div><button class="more-btn" data-delete="${escapeHTML(p.id)}" aria-label="Delete post" title="Delete post">···</button></div>
      <div class="post-caption">${caption}</div>
      ${p.image?`<img class="post-image" src="${escapeHTML(p.image)}" alt="Photo posted by ${escapeHTML(p.author)}" loading="lazy">`:""}
      ${metricMarkup(p)}
      <div class="post-actions"><button class="${p.liked?"liked":""}" data-like="${escapeHTML(p.id)}">${p.liked?"♥":"♡"} ${p.liked?"Liked":"Like"}</button><button data-comment="${escapeHTML(p.id)}">◯ Comment</button><button data-share="${escapeHTML(p.id)}">↗ Share</button><button class="save-action" data-save="${escapeHTML(p.id)}">${p.saved?"▣ Saved":"▱ Save"}</button></div>
    </article>`;
  }
  function renderFeed() {
    let list=[...posts].filter(p=>p.visibility!=="Only me"||p.author==="xanh tick");
    if(searchTerm) list=list.filter(p=>(p.caption+" "+p.author+" "+p.topic).toLowerCase().includes(searchTerm.toLowerCase()));
    const sort=$("#feedSort")?.value||"new";
    list.sort((a,b)=>sort==="old"?a.date.localeCompare(b.date):sort==="likes"?b.likes-a.likes:b.date.localeCompare(a.date));
    $("#feedList").innerHTML=list.length?list.map(postMarkup).join(""):`<div class="empty-state"><b>No posts found</b>Try a different search or create a new post.</div>`;
    $("#statPosts").textContent=posts.filter(p=>p.author==="xanh tick").length;
  }
  function photoCard(p) {
    return `<article class="grid-photo" data-open-post="${escapeHTML(p.id)}"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.caption)}" loading="lazy"><div class="grid-photo-info"><b>${escapeHTML(p.author)}</b><small>${p.showLikes!==false?`♡ ${fmt(p.likes)} · `:""}${dateLabel(p.date)}</small></div></article>`;
  }
  function renderExplore() {
    let list=[...posts].filter(p=>activeFilter==="All"||p.topic===activeFilter);
    if(searchTerm) list=list.filter(p=>(p.caption+" "+p.author+" "+p.topic).toLowerCase().includes(searchTerm.toLowerCase()));
    $("#exploreGrid").innerHTML=list.length?list.map(photoCard).join(""):`<div class="empty-state"><b>No photos found</b>Try another topic.</div>`;
    $$(".filter-chip").forEach(b=>b.classList.toggle("active",b.dataset.filter===activeFilter));
  }
  function renderArchive() {
    const years=[...new Set(posts.map(p=>Number((p.date||"2026").slice(0,4))))].sort((a,b)=>b-a);
    const current=$("#archiveYear").value;
    $("#archiveYear").innerHTML=[...new Set([today.getFullYear(),...years])].sort((a,b)=>b-a).map(y=>`<option value="${y}">${y}</option>`).join("");
    if(current && years.includes(Number(current))) $("#archiveYear").value=current;
    const year=Number($("#archiveYear").value||today.getFullYear());
    const month=$("#archiveMonth").value;
    const q=$("#archiveSearch").value.toLowerCase().trim();
    const list=posts.filter(p=>p.archived!==false&&Number(p.date.slice(0,4))===year&&(month==="all"||Number(p.date.slice(5,7))-1===Number(month))&&(!q||(p.caption+" "+p.topic+" "+p.author).toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date));
    $("#archiveSummary").textContent=`${list.length} ${list.length===1?"post":"posts"} in ${year}${month==="all"?"":` · ${new Date(year,Number(month),1).toLocaleDateString("en-US",{month:"long"})}`}`;
    $("#archiveGrid").innerHTML=list.length?list.map(photoCard).join(""):`<div class="empty-state"><b>No archived posts for this period</b>Choose another year or month, or publish a post with “Save to archive” enabled.</div>`;
  }
  function renderProfile() {
    const mine=posts.filter(p=>p.author==="xanh tick");
    $("#profileHeader").innerHTML=`<img class="profile-cover" src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80" alt="Mountain cover"><div class="profile-head-row"><div class="profile-bubble">X</div><div><h2>xanh tick <span class="verified">✓</span></h2><small class="muted">@xanh_tick</small></div><button class="secondary" data-view="upload">＋ Create post</button></div><p class="profile-bio">Photography lover 📸 · Travel · Nature · Life<br>Better things ahead ✨</p><div class="profile-stats"><div><b>${mine.length}</b><small>Posts</small></div><div><b>4.8K</b><small>Followers</small></div><div><b>320</b><small>Following</small></div></div>`;
    $("#profileCount").textContent=`${mine.length} posts`;
    $("#profileGrid").innerHTML=mine.length?mine.map(photoCard).join(""):`<div class="empty-state"><b>Your gallery is waiting</b>Create a post to see it here.</div>`;
    $("#statPosts").textContent=mine.length;
  }
  function renderSaved() {
    const list=posts.filter(p=>p.saved);
    $("#savedGrid").innerHTML=list.length?list.map(photoCard).join(""):`<div class="empty-state"><b>No saved posts yet</b>Tap “Save” on a post to keep it here.</div>`;
  }
  function readFiles(files) {
    const valid=[...files].filter(f=>f.type.startsWith("image/"));
    if(valid.length!==files.length) toast("Only image files are supported.");
    chosenFiles=valid.slice(0,8);
    if(files.length>8) toast("You can add up to 8 images per post in this demo.");
    $("#selectedPreview").innerHTML=chosenFiles.map((f,i)=>`<div class="preview-thumb"><img src="${URL.createObjectURL(f)}" alt="Selected image ${i+1}"><button type="button" data-remove-file="${i}" aria-label="Remove image">×</button></div>`).join("");
  }
  async function fileToDataURL(file) {
    return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
  }
  function resetUpload() {
    chosenFiles=[];$("#photoInput").value="";$("#selectedPreview").innerHTML="";$("#captionInput").value="";$("#captionCount").textContent="0/500";
    $("#likesInput").value=1200;$("#viewsInput").value=8500;$("#showLikesInput").checked=true;$("#showViewsInput").checked=true;$("#visibilityInput").value="Public";$("#archiveInput").checked=true;$("#topicInput").value="Photography";$("#postDateInput").value=isoDate(today);
  }

  document.addEventListener("click", async e=>{
    const view=e.target.closest("[data-view]"); if(view){e.preventDefault();go(view.dataset.view);return;}
    const tag=e.target.closest("[data-tag]"); if(tag){activeFilter=tag.dataset.tag;go("explore");renderExplore();return;}
    const filter=e.target.closest("[data-filter]"); if(filter){activeFilter=filter.dataset.filter;renderExplore();return;}
    const step=e.target.closest("[data-step]"); if(step){const input=$(`#${step.dataset.step}Input`);input.value=Math.max(0,Math.min(999999999,Number(input.value||0)+Number(step.dataset.delta)));return;}
    const removeFile=e.target.closest("[data-remove-file]"); if(removeFile){chosenFiles.splice(Number(removeFile.dataset.removeFile),1);$("#selectedPreview").innerHTML=chosenFiles.map((f,i)=>`<div class="preview-thumb"><img src="${URL.createObjectURL(f)}" alt="Selected image ${i+1}"><button type="button" data-remove-file="${i}">×</button></div>`).join("");return;}
    const like=e.target.closest("[data-like]"); if(like){const p=posts.find(x=>x.id===like.dataset.like);if(p){p.liked=!p.liked;p.likes=Math.max(0,Number(p.likes)+(p.liked?1:-1));persist();refreshViews();}return;}
    const save=e.target.closest("[data-save]"); if(save){const p=posts.find(x=>x.id===save.dataset.save);if(p){p.saved=!p.saved;persist();refreshViews();toast(p.saved?"Post saved":"Removed from saved");}return;}
    const del=e.target.closest("[data-delete]"); if(del){if(confirm("Delete this post from this browser?")){posts=posts.filter(p=>p.id!==del.dataset.delete);persist();refreshViews();toast("Post deleted");}return;}
    const comment=e.target.closest("[data-comment]"); if(comment){const p=posts.find(x=>x.id===comment.dataset.comment);const msg=prompt("Write a demo comment (not shared online):");if(msg?.trim()&&p){p.comments=Number(p.comments)+1;persist();refreshViews();toast("Demo comment added");}return;}
    const share=e.target.closest("[data-share]"); if(share){const p=posts.find(x=>x.id===share.dataset.share);if(p){try{await navigator.clipboard.writeText(`${p.caption}\n${p.image}`);toast("Post caption and image link copied");}catch{toast("Share: "+p.caption.slice(0,80));}}return;}
    const open=e.target.closest("[data-open-post]"); if(open){const p=posts.find(x=>x.id===open.dataset.openPost);if(p){go("home");setTimeout(()=>{$(`[data-post-id="${CSS.escape(p.id)}"]`)?.scrollIntoView({behavior:"smooth",block:"center"});},80);}return;}
  });
  $("#globalSearch").addEventListener("input",e=>{searchTerm=e.target.value.trim();if(activeView==="home")renderFeed();if(activeView==="explore")renderExplore();});
  $("#feedSort").addEventListener("change",renderFeed);
  $("#photoInput").addEventListener("change",e=>readFiles(e.target.files));
  $("#captionInput").addEventListener("input",e=>$("#captionCount").textContent=`${e.target.value.length}/500`);
  $("#postDateInput").value=isoDate(today);
  $("#clearUpload").addEventListener("click",resetUpload);
  $("#uploadForm").addEventListener("submit",async e=>{
    e.preventDefault();
    if(!chosenFiles.length){toast("Choose at least one photo first.");return;}
    const files=chosenFiles.slice();
    const likes=Math.max(0,Number($("#likesInput").value||0)),views=Math.max(0,Number($("#viewsInput").value||0));
    const date=$("#postDateInput").value||isoDate(today);
    const caption=$("#captionInput").value.trim();
    const topic=$("#topicInput").value;
    const visibility=$("#visibilityInput").value;
    const archived=$("#archiveInput").checked;
    const showLikes=$("#showLikesInput").checked,showViews=$("#showViewsInput").checked;
    if(files.reduce((n,f)=>n+f.size,0)>3_500_000){toast("For this browser-only demo, keep total selected images under 3.5 MB.");return;}
    try{
      const newPosts=[];
      for(const file of files){
        newPosts.push({id:"post-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),author:"xanh tick",date,caption,topic,image:await fileToDataURL(file),likes,views,comments:0,shares:0,showLikes,showViews,visibility,archived,liked:false,saved:false});
      }
      posts=[...newPosts,...posts];persist();resetUpload();renderFeed();go("home");toast("Post published in this browser!");
    }catch(err){console.error(err);toast("Could not save these photos. Try smaller files.");}
  });
  ["archiveYear","archiveMonth","archiveSearch"].forEach(id=>$("#"+id).addEventListener(id==="archiveSearch"?"input":"change",renderArchive));
  $("#accentSelect").addEventListener("change",e=>{const colors={blue:"#2388ff",purple:"#9a70ff",green:"#18b889"};document.documentElement.style.setProperty("--accent",colors[e.target.value]||colors.blue);});
  $("#compactToggle").addEventListener("change",e=>document.body.classList.toggle("compact",e.target.checked));
  $("#exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),posts},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pixora-backup.json";a.click();URL.revokeObjectURL(a.href);toast("Backup exported");});
  $("#resetBtn").addEventListener("click",()=>{if(confirm("Reset all demo posts and restore sample data?")){posts=samplePosts.map(p=>({...p}));persist();refreshViews();go("home");toast("Demo data reset");}});
  $("#notificationsBtn").addEventListener("click",()=>toast("You're all caught up!"));
  $("#topAvatar").addEventListener("click",()=>go("profile"));
  function refreshViews(){renderFeed();if(activeView==="explore")renderExplore();if(activeView==="archive")renderArchive();if(activeView==="profile")renderProfile();if(activeView==="saved")renderSaved();}
  renderFeed();renderExplore();renderArchive();renderProfile();
  go("home");
})();