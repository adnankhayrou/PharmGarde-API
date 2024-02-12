import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CartItemsService } from '../src/cart-items/cart-items.service';
import { Model } from 'mongoose';

const mockCartItemModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockCartModel = {
  findById: jest.fn(),
};

const mockProductModel = {
  findById: jest.fn(),
};

const cartItemsService = new CartItemsService(
  mockCartModel as unknown as Model<any>,
  mockProductModel as unknown as Model<any>,
  mockCartItemModel as unknown as Model<any>,
);

describe('CartItemsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addProductToCart', () => {
    it('should add product to existing cart', async () => {
      const cartId = 'existingCartId';
      const productId = 'existingProductId';
      const quantity = 2;
      const existingCart = { id: cartId };
      const existingProduct = { id: productId };
      const existingCartItem = null;

      mockCartModel.findById.mockResolvedValue(existingCart);
      mockProductModel.findById.mockResolvedValue(existingProduct);
      mockCartItemModel.findOne.mockResolvedValue(existingCartItem);
      mockCartItemModel.create.mockResolvedValue({ toJSON: () => ({ cartId, productId, quantity }) });

      const result = await cartItemsService.addProductToCart(cartId, productId, quantity);

      expect(result).toEqual({ cartId, productId, quantity });
      expect(mockCartItemModel.findOne).toHaveBeenCalledWith({ cartId, productId });
      expect(mockCartItemModel.create).toHaveBeenCalledWith({ cartId, productId, quantity });
    });

    it('should throw NotFoundException for non-existing product', async () => {
      const cartId = 'existingCartId';
      const productId = 'nonExistingProductId';
      const quantity = 2;
      const existingCart = { id: cartId };
      const existingProduct = null;

      mockCartModel.findById.mockResolvedValue(existingCart);
      mockProductModel.findById.mockResolvedValue(existingProduct);

      await expect(cartItemsService.addProductToCart(cartId, productId, quantity)).rejects.toThrowError(NotFoundException);
    });

    it('should throw NotFoundException for non-existing cart', async () => {
      const cartId = 'nonExistingCartId';
      const productId = 'existingProductId';
      const quantity = 2;
      const existingCart = null;
      const existingProduct = { id: productId };

      mockCartModel.findById.mockResolvedValue(existingCart);
      mockProductModel.findById.mockResolvedValue(existingProduct);

      await expect(cartItemsService.addProductToCart(cartId, productId, quantity)).rejects.toThrowError(NotFoundException);
    });

    it('should throw InternalServerErrorException for any other error', async () => {
      const cartId = 'existingCartId';
      const productId = 'existingProductId';
      const quantity = 2;

      mockCartModel.findById.mockRejectedValue(new Error());

      await expect(cartItemsService.addProductToCart(cartId, productId, quantity)).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
