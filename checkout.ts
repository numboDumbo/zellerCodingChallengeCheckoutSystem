interface Item {
  sku: string;
  price: number;
}

interface PricingRule {
  (cartItems: Item[], previousTotal: number): number;
}

const makeCheckout = (pricingRules: PricingRule[]) => {
  let cartItems: Item[] = [];

  const scan = (item: Item) => {
    cartItems.push(item);
  }

  const total = (): number => {
    let total = cartItems.reduce((acc, item) => acc + item.price, 0);
    pricingRules.forEach((rule) => (total = rule(cartItems, total)));
    return total;
  }

  const resetCart = () => {
    cartItems = [];
  }
  return {
    scan, total, resetCart
  }
}

// Define pricing rules
const makePricingRules = (products: Products) => {
  const appleTVBulkDiscount: PricingRule = (cartItems, previousTotal: number) => {
    const appleTVs = cartItems.filter((item) => item.sku === "atv").length;
    const discount = Math.floor(appleTVs / 3);
    return (
      previousTotal - discount * products.atv.price
    );
  };

  //Remove the excess of ipad price (default price - flat discounted price) from the total
  const superIPadBulkDiscount: PricingRule = (cartItems, previousTotal: number) => {
    const DISCOUNTED_IPD_PRICE = 499.99;
    const superIPads = cartItems.filter((item) => item.sku === "ipd").length;
    if (superIPads > 4) {
      return previousTotal - superIPads * (products.ipd.price - DISCOUNTED_IPD_PRICE);
    }
    return previousTotal;
  };

  return {
    appleTVBulkDiscount, superIPadBulkDiscount
  }
}


// Define products
const products: { [sku: string]: Item } = {
  ipd: { sku: "ipd", price: 549.99 },
  mbp: { sku: "mbp", price: 1399.99 },
  atv: { sku: "atv", price: 109.5 },
  vga: { sku: "vga", price: 30 },
};
type Products = typeof products;

// Usage example
const co = makeCheckout(Object.values(makePricingRules(products)));
co.scan(products.atv);
co.scan(products.atv);
co.scan(products.atv);
co.scan(products.vga);
const total = co.total();
console.log("Total:", total); // Output: Total: 249

// Another example
co.resetCart(); // Reset cart
co.scan(products.atv);
co.scan(products.ipd);
co.scan(products.ipd);
co.scan(products.atv);
co.scan(products.ipd);
co.scan(products.ipd);
co.scan(products.ipd);
const total2 = co.total();
console.log("Total:", total2); // Output: Total: 2718.95

