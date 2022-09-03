const mercadopago = require('mercadopago');
const Order = require('../models/order');
const OrderHasProduct = require('../models/order_has_products');
const User = require('../models/user');

mercadopago.configure({
    sandbox: true,
    access_token: 'TEST-5077757554920833-120917-ba1ac019d8d8e874ec3fe4b395abea5f-1033571811'
});

module.exports = {

    async createPaymentCreditCart(req, res, next) {
        let payment = req.body;

        console.log(`PAYMENT: ${JSON.stringify(payment)}`);

        const payment_data = {
            description: payment.description,
            transaction_amount: payment.transaction_amount,
            installments: payment.installments,
            payment_method_id: payment.payment_method_id,
            token: payment.token,
            issuer_id: payment.issuer_id,
            payer: {
                email: payment.email,
            }
        }
        const data = await mercadopago.payment.create(payment_data).catch((err) => {
            console.log(err);
            return res.status(501).json({
                message: 'Error al crear el pago',
                success: false,
                error: err
            });
        });

        if (data) {
            console.log('Si hay datos correctos');
            if (data !== undefined) {
                const payment_type_id = module.exports.validatePaymentMethod(payment.payment_type_id);
                payment.id_payment_method = payment_type_id;

            let order = payment.order;
            order.status = 'PAGADO';
            const data = await Order.create(order);

            console.log('La orden se creo correctamente');

            //Recorrer todos los productos agregados a la orden
            for (const product of order.products) {
                await OrderHasProduct.create(data.id, product.id, product.quantity);
            }

            return res.status(201).json(data.response);
            }
        }
        
    },
    validatePaymentMethod(status) {
        if (status == 'credit_cart') {
            status = 1
        }
        if (status == 'bank_transfer') {
            status = 2
        }
        if (status == 'ticket') {
            status = 3
        }
        if (status == 'upon_delivery') {
            status = 4
        }

        return status;
    }
}

