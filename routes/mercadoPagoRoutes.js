const MercadoPagoController = require('../controllers/mercadoPagoController');
const passport = require('passport');


module.exports = (app) => {

    /*
    *Post routes
    */
   app.post('/api/payments/createPay', passport.authenticate('jwt', {session: false}), MercadoPagoController.createPaymentCreditCart);

   
}