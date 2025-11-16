import express from "express";
import { MercadoPagoConfig, Preference} from "mercadopago";

const client = new MercadoPagoConfig({ 
  accessToken: "APP_USR-2230715129549943-111520-29c1da60bd86b1301d96889250540e50-2603023124" 
})

export const processPayment = async (req: express.Request, res: express.Response) => {
  const packagesData = req.body;

  try {
    const { totalPrice } = packagesData;
    
    const preference = new Preference(client);
  
    const product = await preference.create({
      body: {
        items: [
          {
            id: "1",
            title: "Resumen de compra",
            quantity: 1,
            unit_price: totalPrice,
            currency_id: "ARS"
          }
        ]
      }
    })
  
    const { init_point, sandbox_init_point } = product;
  
    res.status(201).json({ 
      init_point,
      sandbox_init_point
    });
  } catch (error) {
    console.log("Error al crear la preferencia de pago", error);
    res.status(500).json({ error: "ERROR CREATING PREFERENCE" });
  }
}