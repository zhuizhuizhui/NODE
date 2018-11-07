/*
	*
	*
	*
*/

let app=connect();
//use注册中间件
app.use(connect.staticCache());
app.use(connect.query());
//....


/***connect核心模块
   *EventEmitter=require('events').EventEmitter
   *util=require('util')
   *http=require('http')
***/
function createServer(){	
	//创建HTTP服务器request事件处理函数
	function app(req,res){app.handle(req,res)}
	utils.merge(app,proto);
	utils.merge(app.EventEmitter.prototype)
	app.route='/';
	//中间件队列
	app.stack=[];
	//对列索引
	let index=0;
	for(let i=0,len=arguments.length;i<len;++i){
		app.use(arguments[i])
	}
	//use
	app.use=function(route,fn){
		this.stack.push({route:route,handle:fn})
		return this;
	}
	//监听http模块
	app.listen=function(){
		let server=http.createServer(this)
		return server.listen.apply(server,arguments)
	}
	//开始处理app.handle请求
	app.handle=function(req,res,out){
		next()
	}

	function next(err){
		//...
		layer=stack[index++];
		layer.handle(req,res,next)
		//....
	}
	return app;
}