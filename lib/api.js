const request = require('request-promise-native');
const NODE_ENV = process.env.NODE_ENV || 'production';

class apiRequest {
  constructor(jwt) {
    if (!jwt) {
      throw new Error('You must provide a valid Purse Auth Token.');
    }
    this.jwt = jwt;
    if (NODE_ENV === 'production') {
      this.apiUrl = 'https://api.purse.io/api/v1'
    } else {
      this.apiUrl = 'https://master.api.dev.purse.io/api/v1'
    }
    this.createOrder = this.createOrder.bind(this);
    this.modifyOrder = this.modifyOrder.bind(this);
  }
  async bulkChange(bulkMethod, orders) {
    const successfulOrders = [];
    const failedOrders = [];
    
    for (let order of orders) {
      const orderReq = await bulkMethod(order);
      if (orderReq.success) {
        successfulOrders.push(orderReq);
      } else {
        failedOrders.push(orderReq);
      }
    }
    
    return { successfulOrders, failedOrders };
  }
  
  async createBulkOrders(orders) {
    return this.bulkChange(this.createOrder, orders);
  }
  async modifyBulkOrders(orders) {
    return this.bulkChange(this.modifyOrder, orders);
  }
  async createOrder(order) {
    const validOrder = this.buildNYDOrder(order);
    
    if (!validOrder) {
      order.success = false;
      order.errorMessage = 'This was not a valid order';
      return order;
    } else {
      const opts = {
        method: 'POST',
        uri: `${this.apiUrl}/orders/instant`,
        resolveWithFullResponse: true,
        headers: { Authorization: `JWT ${this.jwt}` },
        json: validOrder
      };

      let orderRequest;
      try {
        orderRequest = await request(opts);
      } catch (e) {
        order.success = false;
        order.errorMessage = e.message;
        return order;
      }

      if (orderRequest.statusCode !== 200) {
        order.success = false;
        order.errorMessage = orderRequest.body;
        return order;
      } else {
        order.success = true;
        order.body = orderRequest.body;
        return order;
      }
    }
  }
  async modifyOrder(order) {
    const validModifiedOrder = this.buildModifiedOrder(order);
    
    if (!validModifiedOrder) {
      order.success = false;
      order.errorMessage = 'This was not a valid modified order';
    } else {
      const opts = {
        method: 'PATCH',
        uri: `${this.apiUrl}/orders/${order.id}`,
        resolveWithFullResponse: true,
        headers: { Authorization: `JWT ${this.jwt}` },
        json: validModifiedOrder
      };

      let modifyRequest;
      try {
        modifyRequest = await request(opts);
      } catch (e) {
        order.success = false;
        order.errorMessage = e.message;
        return order;
      }

      if (modifyRequest.statusCode !== 200) {
        order.success = false;
        order.errorMessage = modifyRequest.body;
        return order;
      } else {
        order.success = true;
        order.body = modifyRequest.body;
        return order;
      }
    }
  }
  buildNYDOrder(order) {
    const { asin, quantity, discount, full_name, street1,
            street2, city, state, zip, country, phone } = order;
    if (!asin || !quantity || !discount || !full_name || 
        !street1 || !city || !state || !zip || !country || !phone ) {
      return false;
    }
    
    const orderModel = {
      coin: 'BTC',
      discount: parseFloat(discount),
      country,
      shipping_cost: 0,
      service: {
        type: 'instant',
        items: [{
          asin, quantity
        }],
        shipping_address: {
          full_name, street1, street2, city, state, zip, country, phone
        } 
      }
    };
    return orderModel;
  }
  buildModifiedOrder(order) {
    let { discount, shipping_cost } = order;
    
    const modifyModel = {
      discount,
      shipping_cost
    };
    return modifyModel;
  }
}

module.exports = apiRequest;