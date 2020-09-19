const express = require("express");
const router = express.Router();
const {check,validationResult}=require('express-validator')
const auth=require('../../middleware/auth');
const User = require("../../models/User");
const Posts = require("../../models/Posts");


//@route POST api/posts
//@desc  Create a post
//@access Private

router.post("/", 
[
    auth,
    [
        check('text','Text is required')
            .not()
                .isEmpty()
    ]
],
async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    try{
    const user=await (await (await User.findById(req.user.id)).isSelected('-password'));
    
    const newPost=new Post({
        text:req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    });

    const post=await newPost.save();
    res.json(post);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }

}
);

//@route GET api/posts
//@desc  Get all posts
//@access Private

router.get("/",auth,async (req,res)=>{
    try {
        const posts= await Post.find().sort({date:-1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route Get api/posts/:postid
//@desc  Get post by id
//@access Private

router.get("/:postid",auth,async (req,res)=>{
    try {
        const post= await Post.findById(req.params.postid);
        if(!post)
        res.status(404).json({msg:"No post found"});
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind==="ObjectId")
        res.status(404).json({msg:"No post found"});
        res.status(500).send('Server Error');
    }
})


//@route Delete api/posts/:postid
//@desc  Delete single posts
//@access Private

router.delete("/:postid",auth,async (req,res)=>{
    try {
        const post= await Post.findById(req.params.postid);

        if(!post)
        res.status(404).json({msg:"No post found"});
       
        if(post.user.toString()!==req.user.id){
                return res.status(401).json({msg:"User not authorized"});
        }
         await post.remove();

         res.json({msg:"Post Deleted"})

    } catch (err) {
        console.error(err.message);
        if(err.kind==="ObjectId")
        res.status(404).json({msg:"No post found"})
        res.status(500).send('Server Error');
    }
})

//@route PUT api/posts/like/:id
//@desc  Like a post
//@access Private

router.put("/like/:id", auth, async (req,res)=>{
try {
    const post = await Post.findById(req.params.id);

    //Check if post already been liked by user
    if(post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
        return res.json(400).json({msg:"Post already liked"});
        }

    post.likes.unshift({user:req.user.id})
    await post.save();

    res.json(post.likes);
} catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
}
   

})

//@route PUT api/posts/unlike/:id
//@desc  Unlike a post
//@access Private

router.put("/unlike/:id", auth, async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
    
        //Check if post already been liked by user
        if(post.likes.filter(like=>like.user.toString()===req.user.id).length==0){
            return res.json(400).json({msg:"Post has not yet been liked"});
            }
    
        const removeIndex= post.likes.map(like=>like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex,1);
        await post.save();
    
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
       
    
    })

//@route PUT api/posts/comment/:id
//@desc  Comment on a post
//@access Private

router.post("/comment/:id", auth, async (req,res)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    try{
    const user=await (await (await User.findById(req.user.id)).isSelected('-password'));
    
        const post = await Post.findById(req.params.id);
        
        const newComment={
            text:req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        
        
        post.likes.unshift({user:req.user.id})
        await post.save();
    
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
       
    
    })

    //@route DELETE api/posts/comment/:id/:comment_id
//@desc  Delete a comment on post
//@access Private

router.delete("/comment/:id/:comment_id", auth, async (req,res)=>{
   
    
    try{
        const post = await Post.findById(req.params.id);
        const comment =post.comments.find(comment=>comment.id==req.params.comment_id);
        if(!comment)
        res.status(404).json({msg:"comment does not exist"});
        if(comment.user.toString()!==req.user.id)
        res.status().json({msg:"User not authorized"});
        const removeIndex= post.comments.map(comment=>comment.user.toString())
        .indexOf(req.user.id);
        post.comments.splice(removeIndex,1);
        await post.save();
    
        res.json(post.comments);
    
        
        
      
        
        
       
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
       
    
    })

module.exports = router;
