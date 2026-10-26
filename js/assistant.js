/* Prime Fresh Oil Mills product assistant.
   Self-contained: injects its own CSS and markup. Rule-based, answers only from confirmed facts. */
(function () {
  var WA = "919057292529";
  var KB = [
    { k: ["yellow mustard oil", "mustard oil"], a: "Yellow mustard oil is our hero product, supplied in bulk to oil brands, FMCG and private-label businesses. Tell us the quantity in tonnes, delivery location and packing, and the team will send a quotation." },
    { k: ["sesame"], a: "We supply sesame seeds (a best seller), black sesame seeds and sesame oil (also a best seller)." },
    { k: ["groundnut", "peanut"], a: "Groundnut seeds are one of our best sellers. Add them to your enquiry sheet with your quantity and destination." },
    { k: ["cake", "de-oiled", "deoiled", "feed"], a: "We list yellow mustard cake and black mustard cake. For other cakes, use \"Add a custom product\" in the catalog." },
    { k: ["black mustard", "seed"], a: "Seeds we list: yellow mustard, black mustard, sesame, black sesame and groundnut." },
    { k: ["private label", "own brand", "white label"], a: "Yes. Use \"Start a private-label enquiry\" on this page. Tell us the oil, the volume and how you plan to pack it, and we will come back with what is possible and a quotation." },
    { k: ["sample"], a: "Tick \"A sample\" on the enquiry form and the team will confirm what can be sent." },
    { k: ["spec", "specification", "certificate", "fssai", "iso", "lab", "test report"], a: "Tick \"Spec sheet\" on the enquiry form to request specifications. I cannot confirm certificates or lab reports here, so ask the team for the documents you need." },
    { k: ["price", "rate", "cost", "quote", "quotation", "moq", "minimum"], a: "Minimum order and price are given in the quotation, based on your quantity and packing. Use \"Request quote\" or send the details on WhatsApp." },
    { k: ["capacity", "tonnes per", "how much can"], a: "I do not have a confirmed capacity figure, so I will not guess. The team can answer this directly." },
    { k: ["address", "where are you", "visit", "location"], a: "The mill address has not been added yet. Please call or WhatsApp +91 90572 92529." },
    { k: ["phone", "call", "contact", "email", "whatsapp"], a: "Phone and WhatsApp: +91 90572 92529. Email: Puneet2garg@gmail.com." },
    { k: ["product", "catalog", "catalogue", "what do you", "list"], a: "Oils: yellow mustard oil, sesame oil. Seeds: yellow mustard, black mustard, sesame, black sesame, groundnut. De-oiled cakes: yellow mustard cake, black mustard cake. Anything else, add a custom product." }
  ];
  var QUICK = ["What do you supply?", "Can I get a sample?", "Do you do private label?", "How do I get a price?"];

  var css = ".pf-ai-btn{position:fixed;right:24px;bottom:92px;z-index:60;display:flex;align-items:center;gap:8px;font:600 15px 'Hanken Grotesk',system-ui,sans-serif;background:#06301B;color:#fff;border:2px solid #F2BE45;border-radius:999px;padding:10px 16px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}" +
    ".pf-ai-btn svg{width:18px;height:18px;fill:none;stroke:#F2BE45;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
    ".pf-ai{position:fixed;right:24px;bottom:148px;z-index:61;width:min(380px,calc(100vw - 32px));max-height:min(560px,calc(100vh - 170px));display:flex;flex-direction:column;background:#fff;color:#10261A;border:1px solid #d9e3d0;border-radius:14px;box-shadow:0 12px 36px rgba(0,0,0,.3);font:400 15px/1.5 'Hanken Grotesk',system-ui,sans-serif}" +
    ".pf-ai[hidden]{display:none}" +
    ".pf-ai__head{display:flex;justify-content:space-between;align-items:center;background:#06301B;color:#fff;padding:12px 14px;border-radius:13px 13px 0 0}" +
    ".pf-ai__head b{font:700 16px 'Bricolage Grotesque','Hanken Grotesk',sans-serif}" +
    ".pf-ai__x{background:none;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:2px 8px}" +
    ".pf-ai__log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:160px}" +
    ".pf-ai__m{max-width:88%;padding:9px 12px;border-radius:12px;white-space:pre-wrap}" +
    ".pf-ai__bot{background:#F2F6EC;align-self:flex-start}.pf-ai__me{background:#0B6B3A;color:#fff;align-self:flex-end}" +
    ".pf-ai__m a{color:#0A4A2A;font-weight:700}" +
    ".pf-ai__quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}" +
    ".pf-ai__quick button{font:inherit;font-size:13px;border:1px solid #0B6B3A;color:#0B6B3A;background:#fff;border-radius:999px;padding:5px 10px;cursor:pointer}" +
    ".pf-ai__form{display:flex;gap:8px;padding:10px 14px;border-top:1px solid #d9e3d0}" +
    ".pf-ai__form input{flex:1;min-width:0;font:inherit;padding:8px 10px;border:1px solid #d9e3d0;border-radius:8px}" +
    ".pf-ai__form button{font:inherit;font-weight:700;background:#F2BE45;color:#06301B;border:0;border-radius:8px;padding:8px 14px;cursor:pointer}" +
    ".pf-ai button:focus-visible,.pf-ai input:focus-visible,.pf-ai-btn:focus-visible{outline:3px solid #F2BE45;outline-offset:2px}" +
    "@media (max-width:900px){.pf-ai-btn{bottom:84px;right:12px}.pf-ai{bottom:136px;right:12px;max-height:calc(100vh - 160px)}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement("button");
  btn.className = "pf-ai-btn"; btn.type = "button"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "pfAi");
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>Ask about products';
  var box = document.createElement("div");
  box.className = "pf-ai"; box.id = "pfAi"; box.hidden = true; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Product assistant");
  box.innerHTML = '<div class="pf-ai__head"><b>Product assistant</b><button class="pf-ai__x" type="button" aria-label="Close assistant">&times;</button></div>' +
    '<div class="pf-ai__log" aria-live="polite"></div><div class="pf-ai__quick"></div>' +
    '<form class="pf-ai__form"><input type="text" aria-label="Ask a question" placeholder="Ask about products or samples"><button type="submit">Ask</button></form>';
  document.body.appendChild(btn); document.body.appendChild(box);

  var log = box.querySelector(".pf-ai__log"), input = box.querySelector("input"), started = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function add(who, html) { var d = document.createElement("div"); d.className = "pf-ai__m pf-ai__" + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function ask(q) {
    q = q.trim(); if (!q) return;
    add("me", esc(q));
    var s = q.toLowerCase(), hit = null;
    for (var i = 0; i < KB.length && !hit; i++) for (var j = 0; j < KB[i].k.length; j++) if (s.indexOf(KB[i].k[j]) > -1) { hit = KB[i]; break; }
    if (hit) add("bot", esc(hit.a));
    else add("bot", "I do not have a confirmed answer to that, so I will not guess. " +
      '<a target="_blank" rel="noopener" href="https://wa.me/' + WA + "?text=" + encodeURIComponent("Hello, I have a question: " + q) + '">Send this question to the team on WhatsApp</a>');
  }
  var quick = box.querySelector(".pf-ai__quick");
  quick.innerHTML = QUICK.map(function (q) { return '<button type="button">' + esc(q) + "</button>"; }).join("");
  quick.addEventListener("click", function (e) { if (e.target.tagName === "BUTTON") ask(e.target.textContent); });
  box.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); input.value = ""; });

  function open(o) {
    box.hidden = !o; btn.setAttribute("aria-expanded", o);
    if (o) {
      if (!started) { started = true; add("bot", "Hello. I can answer questions about our products, samples and quotes. What would you like to know?"); }
      input.focus();
    } else btn.focus();
  }
  btn.addEventListener("click", function () { open(box.hidden); });
  box.querySelector(".pf-ai__x").addEventListener("click", function () { open(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) open(false); });
})();
