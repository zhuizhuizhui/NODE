let crypto=require('crypto'),
    Db=require('./db'),
    mongodb=new Db();

function User(user){
    this.name=user.name;
    this.password=user.password;
    this.email=user.email;
}

module.exports=User;

User.prototype.save=function(cb){
    let md5=crypto.createHash('md5'),
        email_MD5=md5.update(this.email.toLowerCase()).digest('hex'),
        head="http://www.gravatar.com/avatar/"+email_MD5+"?s=48";//type
    let user={
        username:this.name,
        password:this.password,
        email:this.email,
        head:head
    }
    mongodb.insertUser(user,(err,result)=>cb(err,result))
}

User.get=function(name,cb){    
    mongodb.findUser({username:name},result=>cb(result))
}