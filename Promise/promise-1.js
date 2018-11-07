//恶魔金字塔
obj.api1(val1=>{
	obj.api2(val2=>{
		obj.api3(val3=>{
			obj.api4(val4=>{
				cb(val4)
			})
		})
	})
})

//优化1
var handler1=val1=>{
	obj.api2(val1,handler2)
}

var handler2=val2=>{
	obj.api3(val2,handler3)
}

var handler3=val3=>{
	obj.api4(val3,handler4)
}

var handler4=val4=>{
	cb(val4)
}

obj.api(hanlder1)

//优化2
const EventEmitter=require('events').EventEmitter;
let emitter=new EventEmitter();

emitter.on('step1',()=>{
	obj.api1(val1=>{
		emitter.emit('step2',val1)
	})
})

emitter.on('step2',val1=>{
	obj.api2(val1,val2=>{
		emitter.emit('step3',val2)
	})
})

emitter.on('step3',val2=>{
	obj.api3(val2,val3=>{
		emitter.emit('step4',val3)
	})
})

emitter.on('step4',val3=>{
	obj.api4(val3,val4=>{
		cb(val4)
	})
})

emitter.emit('step1');

//优化3
promise()
	.then(obj.api1)
	.then(obj.api2)
	.then(obj.api3)
	.then(obj.api4)
	.then(val4=>{
		//resolve
	},err=>{
		//reject
	})
	.done()