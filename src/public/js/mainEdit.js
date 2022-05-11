console.log('Static javascript working')

btnCp = document.getElementById('copier')

function copy() {
  var link = document.getElementById("link");
  var copyText = link.innerHTML
  if (copyText.startsWith('https://notenet.es/anonimus-msg/')){
      navigator.clipboard.writeText(copyText);
      alert('Link copied to clipboard!')
  }else{
      alert('Error copying the text. Please, try manually')
      console.log(copyText)
  }
}

btnCp.addEventListener('click', copy)

