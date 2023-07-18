const Category = require('../models/category')

const all_category = async (req,res,next)=>{
    try{
        const categoryList = await Category.find();
    if(!categoryList){
        res.status(500).json({
            success: false
        })
    }
    res.status(200).send(categoryList);
    }catch(error){
        next(error)
    }  
}

const update_category = async (req,res,next)=>{
    try{
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                icon: req.body.icon,
                color: req.body.color,
            }, {new: true} // tra lai du lieu moi cap nhat
            );
        res.status(200).send(category);
    }catch(error){
        next(error)
    }
}

const get_category = async (req,res, next)=>{
    try{
        const category = await Category.findById(req.params.id);
        if(!category){
            res.status(500).json({
                message: "Category with id notfound"
            })
        }
        res.status(200).send(category);
    }catch(error){
        next(error)
    }
}

const create_category = async(req,res,next)=>{
    try{
        const category = new Category({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color, 
        })
        const savedCategory = await category.save()
        if(!savedCategory ) res.status(404).send('the category cannot be created')
    
        res.send(savedCategory)
    }catch(error){
        next(error)
    }
}

const delete_category = (req,res,next)=>{
    try{
        Category.findByIdAndRemove(req.params.id)
        //ham tra ve promise
        .then((result)=>{
            if(result){
                res.status(200).json({
                    success: true,
                    message: 'the category is deleted'
                })
            }else{
                return res.status(404).json({
                    success: false,
                    message: "NOT FOUND"
                })
            }
        })

    }catch(error){
        next(error)
    }
}

module.exports = {
    all_category,
    update_category,
    get_category,
    create_category,
    delete_category
}