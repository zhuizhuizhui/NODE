//流程控制模块async
//串行执行
async.series([
	cb=>{
		fs.readFile('a.txt','utf=8',cb)
	},
	cb=>{
		fs.readFile('b.txt','utf=8',cb)
	},
	(err,result)=>{
		//result=>[a.txt,b.txt]
	}
	])
//上述代码等价于
fs.readFile('a.txt','utf-8',(err,content)=>{
	if(err)return cb(err)
	fs.readFile('b.txt','utf-8',(err,data)=>{
		if(err)return cb(err)
		cb(null,data)
	})
})
//此处的回调函数由async通过高阶函数的方式注入，
//这里隐含了特殊的逻辑。每隔cb执行结束时会将结果
//保存下来，然后执行下一个调用，直到结束所有调用
//，最终的回调函数执行时，队列立的异步调用保存的
//结果以数组方式传入，这里的异常处理规则是一旦出
//现异常，就结束所有调用并将异常传递给最终回调函
//数的第一个参数
//并行执行
async.parallel([
	cb=>{
		fs.readFile('a.txt','utf-8',cb)
	},
	cb=>{
		fs.readFile('b.txt','utf-8',cb)
	},
	(err,result)=>{
		//result=>[a.txt,b.txt]
	}
	])
//上述代码等价于
let counter=2,
	result=[],
	done=(index,val)=>{
		result[index]=val;
		counter--;
		if(counter==0)
			cb(null,result)
	};
	//只传递一个异常
	let hasErr=false,
		fail=err=>{
			if(!hasErr){
				hasErr=true;
				cb(err)
			}
		};
	fs.readFile('a.txt','utf-8',(err,content)=>{
		if(err) return fail(err)
			done(0,content)
	});
	fs.readFile('b.txt','utf-8',(err,data)=>{
		if(err) return fail(err)
			done(1,content)
	});
//没有深度嵌套,没有复杂的状态判断，他的诀窍是依然来自于注
//入的回调函数。paraller方法对于异常的判断依然是一旦某个异
//步调用产生异常，就会将异常作为第一个参数掺入个最终的回调
//函数。只有所有一步调用都正常完成时，才会间接多以数组的方式
//传入。

//依赖处理 前一个结果是后一个调用的输入时
async.waterfall([
	cb=>{
		fs.readFile('a.txt','utf-8',(err,content)=>{
			//content=>a.txt
			cb(err,content)			
		})
	},
	(arg1,cb)=>{
		//arg1=>a.txt
		fs.readFile(arg1,'utf-8',(err,content)=>{
			//content=>b.txt
			cb(err,content)
		})
	},
	(arg1,cb)=>{
		//arg1=>b.txt
		fs.readFile(arg1,'utf-8',(err,content)=>{
			//content=>c.txt
			cb(err,content)
		})
	},
	(err,content)=>{
		//result=>c.txt		
	}
	])
//上述代码等价于
fs.readFile('a.txt','utf-8',(err,data1)=>{
	if(err)return cb(err)
	fs.readFile(data1,'utf-8',(err,data2)=>{
		if(err) return cb(err)
		fs.readFile(data2,'utf-8',(err,data3)=>{
			if(err)return cb(err)	
			cb(null,data3)
		}
	})
})



//自动依赖处理 
/***********业务场景***************
****从磁盘读取配置文件
****根据配置文件连接mongoDB
****根据配置文件链接redis
****编译静态文件
****上传静态文件到CDN
****启动服务器
***********************************/
let deps={
	readConfig:(cb)=>{
		//read confing file
		cb()
	},
	contentMongoDB:('readConfig',cb=>{
		//connect to MongoDB
		cb()
	}),
	contentReadis:('readConfig',cb=>{
		//connect to Readis
		cb()
	}),
	compileAsserts:cb=>{
		//compile asserts
		cb()
	},
	uploadAsserts:('compileAsserts',cb=>{
		//upload to asserts
		cb()
	}),
	startup:('contentMongoDB','contentReadis','uploadAsserts',cb=>{
		//startup
	})
}