import express from "express";
import { AppDataSource } from "../config/database";
import Product from "../entities/product.entity";

const productRepository = AppDataSource.getRepository(Product) 

export const getAllProducts = async (req: express.Request, res: express.Response) => {
  try {
    const products = await productRepository.find();
    
    if (products.length === 0) return res.status(404).json({ error: "PRODUCTS NOT FOUND" })
    
    res.status(200).json(products);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export const getProductById = async (req: express.Request, res: express.Response) => {
  const { productId } = req.params;

  try {
    const product = await productRepository.findOneBy({ productId: Number(productId) });
  
    if (!product) return res.status(404).json({ error: "PRODUCT NOT FOUND" })

    res.status(200).json(product);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })    
    }
  }
}

export const createProduct = async (req: express.Request, res: express.Response) => {
  const { productName, productPrice, productDesc, productSize, productIsActive } = req.body;

  if (!productName || !productPrice || !productDesc || !productSize || !productIsActive) {
    return res.status(400).json({ error: "REQUIRED FIELDS ARE INCOMPLETE" });
  }

  if (productName.length <= 4) {
    return res.status(400).json({ error: "PRODUCT NAME MUST BE LONGER THAN 4 CHARACTERS" });
  }

  try {
    const existingProduct = await productRepository.findOne({ where: { productName } });
  
    if (existingProduct) return res.status(409).json({ error: "EXISTING PRODUCT" });

    const product = productRepository.create({
      productName,
      productPrice,
      productDesc,
      productSize,
      productIsActive
    });
  
    await productRepository.save(product);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "ERROR CREATING PRODUCT" });
  }
}

export const updateProduct = async(req: express.Request, res: express.Response) => {
  const { productId } = req.params;
  const { productName } = req.body;
  
  try {
    const currentProduct = await productRepository.findOneBy({ productId: Number(productId) });

    if (!currentProduct) return res.status(404).json({ error: "PRODUCT NOT FOUND" });

    if (productName && productName.length <= 4) {
      return res.status(400).json({ error: "PRODUCT MUST BE LONGER THAN 4 CHARACTERS" })
    }

    if (productName) {
      const existingProduct = await productRepository.findOne({ where: { productName } });

      if (existingProduct) return res.status(409).json({ error: "PRODUCT ALREADY EXISTS" });
    }

    await productRepository.update({ productId: Number(productId) }, req.body);

    const updatedProduct = await productRepository.findOneBy({ productId: Number(productId) });

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })    
    }
  }
}

export const removeProduct = async (req: express.Request, res: express.Response) => {
  const { productId } = req.params;  

  try {
    const productToRemove = await productRepository.findOneBy({ productId: Number(productId) });
      
    if (!productToRemove) return res.status(404).json({ error: "PRODUCT NOT FOUND" });
    
    await productRepository.remove(productToRemove);
    
    res.status(200).json(productToRemove);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })    
    }
  }
}