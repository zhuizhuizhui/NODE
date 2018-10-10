/* 监听表单两次输入是否一致 */
let input=document.getElementById('again');
input.addEventListener('blur',function(e){   
    let first = document.getElementById('first').value,
        err=document.getElementById('err');
    console.log(first); 
    if(first!==this.value){
        err.style.display='block'
    }else{
        err.style.display = 'none'
    }
})