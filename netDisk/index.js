const STATE_CODE=[{state:0,msg:'服务器操作失败!'},
                {state:1,msg:'用户名已被占用!'},
                {state:2,msg:'注册成功!!'},
                {state:3,msg:'用户不存在.'},
                {state:4,msg:'密码错误.'},
                {state:5,msg:'登录成功.'},
                {state:6,msg:'上传文件失败'},
                {state:7,msg:'上传文件成功'},
                {state:8,msg:'数据库更新成功'},
                {state:9,msg:'文件删除成功'} 
               ],

    express=require('express'),
    fs=require('fs'),

    mysql=require('mysql'),
    
    multer=require('multer'),      

    bodyparser=require('body-parser'),    
        
    server=express(), 

    db_config={
          host:'localhost',
          user:'root',
          password:'000000',
          post:'3306',
          database:'netdisk'
    },
        
  loginRouter=express.Router(),
  fileRouter=express.Router();

server.use(bodyparser.json());
server.use(bodyparser.urlencoded({extended:false}));
server.use(multer({ dest: __dirname+'/Client/uploads/' }).any());

server.use('/',express.static('./Client'));//默认跳转index.html 
server.use('/login',loginRouter);

server.use('/File',fileRouter);

loginRouter.use('/reg',(req,res)=>{ 
  let {username,password}=req.body;       
  //注册用户  查询是否存在  
  let querySql=`SELECT * FROM regInfo WHERE userName='${username}'`;
  handDB(querySql,(err,result)=>{
    if(err){      
      res.send(STATE_CODE[0]);
    }else{      
      if(result.length>=1){        
        res.send(STATE_CODE[1])
      }else{        
        let insertSql=`INSERT INTO regInfo(userName,password) VALUES('${username}','${password}')`;
        handDB(insertSql,(err,result)=>{          
          if(err){            
            res.send(STATE_CODE[0]);
          }else{            
            let creatSql=`CREATE TABLE ${username}(ID int(255) NOT NULL AUTO_INCREMENT,
                                                    fileName varchar(255) NOT NULL,
                                                    type varchar(255) NULL,
                                                    size varchar(255) NOT NULL,
                                                    downLoad int(255) NOT NULL,
                                                    PRIMARY KEY (ID))`;
            handDB(creatSql,(err,result)=>{              
              if(err)
                res.send(STATE_CODE[0])
              else
                res.send(STATE_CODE[2])
            })
          }
        })
      }
    }
  })  
})

loginRouter.use('/',(req,res)=>{
    let {username,password}=req.body,
        querySql=`SELECT * FROM regInfo WHERE userName='${username}'`;
    handDB(querySql,(err,result)=>{
      if(err){
        res.send(STATE_CODE[0])
      }else{
        if(!result.length){
          res.send(STATE_CODE[3])
        }else{
          if(result[0].password==password){
            let queryFileSql=`SELECT * FROM allfiles`;
            handDB(queryFileSql,(err,result)=>{
              if(err)
                res.send(STATE_CODE[0])
              else
                res.send(Object.assign(STATE_CODE[5],{files:result}));
            })
          }else{
            res.send(STATE_CODE[4]);
          }
        }
      }
    })        
})

fileRouter.use('/up', function(req, res) {    
  let file=req.files[0],
      {username,time}=req.body;
      fs.rename(file.path,file.destination+file.originalname,err=>{
        if(err)
          return res.send(STATE_CODE[6])
      })
      //存入文件数据库        
    let data1=[username,file.originalname,time,file.mimetype,(file.size)/1024,0],
        data2=[file.originalname,file.mimetype,(file.size)/1024,0],
        insertFileSql=`INSERT INTO allfiles(userName,fileName,time,type,size,downLoad) VALUES('${data1[0]}','${data1[1]}','${data1[2]}','${data1[3]}','${data1[4]}','${data1[5]}')`,
        insertUserFile=`INSERT INTO ${username}(fileName,type,size,downLoad) VALUES('${data2[0]}','${data2[1]}','${data2[2]}','${data2[3]}')`;          

    handDB(insertUserFile,(err,result)=>{
      if(err)
        res.send(STATE_CODE[0])
    })    

    handDB(insertFileSql,(err,result)=>{
        if(err)
          res.send(STATE_CODE[0])
        else
          res.send(Object.assign(STATE_CODE[7],{files:data1.concat(result.insertId)}));
    })
});  


fileRouter.use('/down',(req,res)=>{
  //更新数据库down  user  allfiles  
    let {filename,username}=req.query,        
        userSql=`UPDATE ${username} SET downLoad=downLoad+1 WHERE fileName='${filename}'`,
        fileSql=`UPDATE allfiles SET downLoad=downLoad+1 WHERE userName='${username}' AND fileName='${filename}'`;
          
        handFiles(res,userSql); 
        handFiles(res,fileSql);
        res.send(STATE_CODE[8]);//以上两次更新都没有出错执行该句
})

fileRouter.use('/remove',(req,res)=>{
  let {filename,username}=req.query,
      userSql=`DELETE FROM ${username} WHERE fileName='${filename}'`,
      fileSql=`DELETE FROM allFiles WHERE userName='${username}' AND fileName='${filename}'`;
      handFiles(res,userSql);
      handFiles(res,fileSql);
      localFileRemove(res,filename);
      res.send(STATE_CODE[9]);//以上两次更新都没有出错执行该句
})

server.listen(8001,()=>{console.log('server is running 8001....')});

function handDB(sql,cb){  
  let conn=mysql.createConnection(db_config);
  conn.query(sql,(err,result)=>{
    cb(err,result);
  })
  conn.end();
}

function handFiles(res,sql){   
  let conn=mysql.createConnection(db_config);
      conn.query(sql,(err,result)=>{       
        if(err)
          res.send(STATE_CODE[0])                  
      })
      conn.end();
}

function localFileRemove(res,filename){  
  let path=__dirname+'/Client/uploads/'+filename;
    fs.unlink(path,err=>{
       if(err)
          res.send(STATE_CODE[0])
        else
          res.send(STATE_CODE[8]);
    })
}