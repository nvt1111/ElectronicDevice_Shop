const Coupon = require('../models/coupon')

const createCoupon = async (req, res) => {
    try {
        const currentDate = new Date();
        const exprireDate = new Date(currentDate);
        exprireDate.setDate(currentDate.getDate() + 100);

        const data = {
            ...req.body,
            exprireDate
        }
        const newCoupon = await Coupon.create(data);

        res.json({
            message: "Add successfull",
            data: newCoupon
        })
    } catch (e) {
        console.log(e)
    }
}



module.exports = {
    createCoupon,

}