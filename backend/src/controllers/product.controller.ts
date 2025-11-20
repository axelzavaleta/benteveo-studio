import express from "express";
import { AppDataSource } from "../config/database";
import Product from "../entities/product.entity";
import { Tag } from "../entities/productTag.entity";
import { Platform } from "../entities/platform.entity";
import { Language } from "../entities/language.entity";
import { In } from "typeorm";

const productRepository = AppDataSource.getRepository(Product); 
const tagRepository = AppDataSource.getRepository(Tag);
const platformRepository = AppDataSource.getRepository(Platform);
const languageRepository = AppDataSource.getRepository(Language);

export const getAllProducts = async (req: express.Request, res: express.Response) => {
  try {
    const products = await productRepository.find({relations: ["tags", "platforms", "languages"]});
    
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
    const product = await productRepository.findOne({
      where: { productId: Number(productId) },
      relations: ['tags', 'platforms', 'languages']
    });
  
    if (!product) return res.status(404).json({ error: "PRODUCT NOT FOUND" })

    res.status(200).json(product);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })    
    }
  }
}

export const createProduct = async (req: express.Request, res: express.Response) => {
  const { 
    productName, 
    productShortDesc, 
    productLongDesc, 
    productSize, 
    productDeveloper, 
    productCoverImageUrl, 
    productCatalogImageUrl, 
    productPrice, 
    productIsActive,
    productReleasedDate,
    tagIds,
    platformIds,
    languageIds,
  } = req.body;

  if (
    !productName || 
    !productShortDesc || 
    !productLongDesc || 
    !productSize || 
    !productDeveloper ||
    !productCoverImageUrl ||
    !productCatalogImageUrl ||
    !productPrice || 
    !productIsActive ||
    !productReleasedDate
  ) {
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
      productShortDesc,
      productLongDesc,
      productSize,
      productDeveloper,
      productCoverImageUrl,
      productCatalogImageUrl,
      productPrice,
      productIsActive,
      productReleasedDate
    });

    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      const tags = await tagRepository.findBy({
        tagId: In(tagIds)
      });

      product.tags = tags;
    }

    if (platformIds && Array.isArray(platformIds) && platformIds.length > 0) {
      const platforms = await platformRepository.findBy({
        platformId: In(platformIds)
      });

      product.platforms = platforms;
    }

    if (languageIds && Array.isArray(languageIds) && languageIds.length > 0) {
      const languages = await languageRepository.findBy({
        languageId: In(languageIds)
      });

      product.languages = languages;
    }

    await productRepository.save(product);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "ERROR CREATING PRODUCT" });
  }
}

export const updateProduct = async (req: express.Request, res: express.Response) => {
  const { productId } = req.params;

  try {
    const product = await productRepository.findOne({
      where: { productId: Number(productId) },
      relations: ["tags", "platforms", "languages"]
    });

    if (!product) return res.status(404).json({ error: "PRODUCT NOT FOUND" });

    if (req.body.productName && req.body.productName.length <= 4) {
      return res.status(400).json({ error: "PRODUCT MUST BE LONGER THAN 4 CHARACTERS" });
    }

    Object.assign(product, req.body);

    if (req.body.tagIds) {
      const tags = await tagRepository.findBy({ tagId: In(req.body.tagIds) });
      product.tags = tags;
    }

    if (req.body.platformIds) {
      const platforms = await platformRepository.findBy({ platformId: In(req.body.platformIds) });
      product.platforms = platforms;
    }

    if (req.body.languageIds) {
      const languages = await languageRepository.findBy({ languageId: In(req.body.languageIds) });
      product.languages = languages;
    }

    await productRepository.save(product);

    res.status(200).json(product);

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const removeProduct = async (req: express.Request, res: express.Response) => {
  const { productId } = req.params;  

  try {
    const productToRemove = await productRepository.findOne({
      where: { productId: Number(productId) },
      relations: ["tags", "platforms", "languages"]
    });

    if (!productToRemove) return res.status(404).json({ error: "PRODUCT NOT FOUND" });
    
    await productRepository.remove(productToRemove);
    
    res.status(200).json(productToRemove);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })    
    }
  }
}