/* Voucher TOP1Y00 (Claude 22/11/2026): 1 ano do plano Top. Quem aprova é o Leandro; aqui só se registra o pedido. */
(function(){
  var box=document.getElementById('vch');if(!box)return;
  var API=(window.VINCI_CHECKOUT_API||'https://palanteerhq.com/vinci-checkout')+'/voucher';
  var btn=document.getElementById('vBtn'),msg=document.getElementById('vMsg');
  function say(t,err){msg.className='msg'+(err?' err':'');msg.textContent=t;}
  btn.addEventListener('click',function(){
    var nome=document.getElementById('vNome').value.trim(),cod=document.getElementById('vCod').value.trim().toUpperCase();
    var email=document.getElementById('email').value.trim().toLowerCase(),tel=document.getElementById('telefone').value;
    if(nome.length<2){say('Digite seu nome.',1);document.getElementById('vNome').focus();return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){say('Digite seu e-mail acima. O link chega nele.',1);document.getElementById('email').focus();return;}
    if(!cod){say('Digite o código do voucher.',1);document.getElementById('vCod').focus();return;}
    var produto=box.getAttribute('data-produto');
    if(produto==='leda-leo'){var r=document.querySelector('input[name=ia]:checked');produto=r?r.value:'leda';}
    btn.disabled=true;say('Conferindo o voucher…');
    fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({codigo:cod,produto:produto,nome:nome,email:email,telefone:tel})})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(x){
        if(x.ok&&x.j.pendente){say(x.j.mensagem||'Você receberá um e-mail com o link para prosseguir.');document.getElementById('vCod').value='';return;}
        btn.disabled=false;say(x.j.erro==='voucher_invalido'?'Voucher inválido. Confira o código.':x.j.erro==='nome_obrigatorio'?'Digite seu nome.':'Não conseguimos conferir agora. Tente de novo em um minuto.',1);
      })
      .catch(function(){btn.disabled=false;say('Não conseguimos conferir agora. Tente de novo em um minuto.',1);});
  });
})();
