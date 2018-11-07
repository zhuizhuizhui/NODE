/*人脸对比match*/
/*
  *1 监听本地服务器
  *2 读取传入内容
  *     监测上传路径，req接收内容
  *3  获取百度aip人脸对比方法接口
  *       传入参数 提交base64数据 和要对比的base64数据
  *
 */
 const AipFaceClient=require('baidu-aip-sdk').face,
        APP_ID='14618870',
        API_KEY='r7devpiArGAentr3jv7D8XKo',
        SERCRET_KEY='w9FmBk1pXkncqjNFswpI9XZqUskoEk23',
        client=new AipFaceClient(APP_ID,API_KEY,SERCRET_KEY),

        HttpClient=require('baidu-aip-sdk').HttpClient;

        HttpClient.setRequestOptions({timeout:5000})

 const http=require('http'),    
	  fs=require('fs'),
	  url=require('url'),
    arr=[],
	  app=http.createServer((req,res)=>{
	  	res.setHeader('Access-Control-Allow-Origin',"*");
	  	let pathname=url.parse(req.url).pathname;
	  	if(req.method.toUpperCase()==='POST'&&pathname==='/updata'){ 
      let str=''       
        req.on('data',(chunk)=>{
            str+=chunk;
        })
        req.on('end',()=>{        
            res.end('ok')
            str=str.replace(/^data:image\/\w+;base64,/g,'');
            arr.push(str);    
            //输出传来的内容到1.txt在http://imgbase64.duoshitong.com/测试没有问题后
            fs.writeFile('./1.txt',str,err=>{
              if(err)console.log('写入失败')
            })
            console.log(str.length)        
            getarr2();
        })
    	}
	  });

    function getarr2(){
      let buf=fs.readFileSync('./images/1.jpg','base64');      
      arr.push(buf);
      getResult();
    }
    function getResult(){
      client.match([{
        image:arr[0],
        image_type:'BASE64'
      },{
        image:arr[1],
        image_type:'BASE64'
      }]).then(data=>{
        console.log(JSON.stringify(data))
        //根据data获取对比结果
      })
    }
 
app.listen(3000,()=>console.log('server is running 3000...'))  