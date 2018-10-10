let Db = require('./db'),    
    markdown=require('markdown').markdown,
    mongodb = new Db();

function Post(name, title,tags, post,head) {
    this.name = name;
    this.head=head;
    this.title = title;
    this.tags=tags;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (cb) {    
    let date = new Date(),
        time = { 
            year:date.getFullYear(),
            day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        },            
        post = {
            username: this.name,
            head:this.head,
            time:time,
            title: this.title,
            tags:this.tags,
            post: this.post,
            comments:[]//评论
        };   
    mongodb.insertArticle(post, (err, result) => cb(err, result));
}

//获取指定具体文章
Post.get = function (userinfo, cb) {
    let info = {}; //获取所有用户文章   
    if (userinfo) info = userinfo;//获取指定用户
    mongodb.findArticle(info, result => {
        result.forEach(doc => {            
            if (doc) {  
                mongodb.updateArticle(info,{$inc:{'pv':1}},(err,result)=>{                    
                    if(err) return cb(err);
                })
                doc.post = markdown.toHTML(doc.post);
                doc.comments.forEach(function (comment) {
                    comment.content = markdown.toHTML(comment.content);
                });
            }
        })
        cb(result)
    });
}
//获取指定篇数文章
Post.getNum=function(num,page,cb){
    mongodb.findArticleNum(num,page,(err,res,total)=>{
        if(err)
        return cb(err)

        res.forEach(doc=>{
            doc.post=markdown.toHTML(doc.post);
        });
        cb(null,res,total);
    })
}

//获取文章信息存档
Post.getArchive=(cb)=>{
    mongodb.getArchive((err,res)=>{
        cb(err,res);
    })
}
//编辑
Post.edit=function(articleInfo,cb){    
    mongodb.findArticle(articleInfo,article=>{        
        cb(article)       
    })
}
//更新
Post.update=function(updateInfo,condition,cb){
    mongodb.updateArticle(updateInfo,condition,(err,raw)=>{
        cb(err,raw);
    })
}
//评论
Post.pushComment=function(condition,update,cb){
    mongodb.findANDupdate(condition,update,(err,doc)=>{
        cb(err,doc);
    })
}
//删除
Post.remove=function(removeInfo,cb){
    mongodb.removeArticle(removeInfo,err=>{
        cb(err);
    })
}
//获取所有标签
Post.getTags=function(cb){
    mongodb.getTags((err,result)=>{
        cb(err,result)
    })
}
//获取指定标签
Post.getTag=(tag,cb)=>{
    let condition={tags:tag};
    mongodb.getOne(condition,(err,result)=>{
        cb(err,result);
    })
}
//搜索文章
Post.search=(title,cb)=>{
    let condition={title:title};
    console.log('condiiton---',condition);
    mongodb.getOne(condition,(err,result)=>{                
        cb(err,result);
    })
}