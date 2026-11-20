const products = [
  { id: 'H1', name: 'StudySound Headphones', model: 'S40', brand: 'Echo Lane',price: 7999, wireless: true,anc: true, battery: '40 hours', colors: [ 'Blue', 'Silver'],
    desc: 'Over-ear wireless headphones with noise cancellation and a long battery. Made for library and dorm study sessions.' },
  { id: 'H2', name: 'CampusQuiet Headphones', model: 'C30', brand: 'Quadwave',price: 9999, wireless: true,anc: true, battery: '30 hours', colors: [ 'Black', 'White'],
    desc: 'Over-ear wireless headphones with noise cancellation that block out cafeteria and hallway noise.' },
  { id: 'H3', name: 'Everyday Wireless Headphones', model: 'E50', brand: 'Northwind',price: 5999, wireless: true,anc: false, battery: '50 hours', colors: [ 'Rose', 'Blue'],
    desc: 'Comfortable wireless over-ear headphones with the longest battery of the bunch. No noise cancellation.' },
  { id: 'H4', name: 'Studio Wired Headphones',model: 'W20',brand: 'Pinegrove', price: 3999,wireless: false,anc: false,battery: 'Not applicable', colors: [ 'Silver'],
    desc: 'Simple wired over-ear headphones. Plug them in and listen, no charging needed.' },
  { id: 'H5', name: 'PremiumQuiet Headphones', model: 'P45', brand: 'Haven Audio',price: 12999, wireless: true,anc: true, battery: '45 hours', colors: [ 'Rose', 'Silver'],
    desc: 'Over-ear wireless headphones with noise cancellation and a very long battery life.' }
];

const stores = [
  { id: 'campus', name: 'Campus Store', address: '100 College Avenue, Riverton, AZ 85001',available: false },
  { id: 'central', name: 'Central Store', address: '250 Main Street, Riverton, AZ 85002',available: true },
  { id: 'north', name: 'North Store', address: '880 Plaza Drive, Riverton, AZ 85003',available: true }
];

const TAX_RATE = 0.08;
const KEY='hp-milestone-1' ;
const colorHex ={ Black: '#222222',Blue: '#2b6cde',White: '#f6f6f6',Silver: '#b9bec7', Rose: '#e8909f' };

const labels = {
  S1: 'S1 — Product results',
  S2: 'S2 — Product details',
  S3: 'S3 — Pickup selection',
  S4: 'S4 — Pickup unavailable',
  S5: 'S5 — Cart',
  S6: 'S6 — Checkout and order review',
  S7: 'S7 — Order confirmation'
};

function freshState() {
  return {
    screen: 'S1',
    filters: { maxPrice: '', wireless: false, anc: false },
    applied: { maxPrice: '', wireless: false, anc: false },
    draft: { id: null,color: '',qty: 1, fulfillment: '',store: '' },
    editing: false,
    cart: null,
    checkout: { name: '', email: '',street: '', city: '',state: '', zip: '' },
    order: null
  };
}

function load() {
  try {
    const saved= JSON.parse(sessionStorage.getItem(KEY));
    if (saved && saved.screen) return Object.assign(freshState(), saved);
  } catch (e) {}
  return freshState();
}

function save() {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}

let state =load();
let payment= { card: '', exp: '',cvc: '' };
let errors={};

const app=document.getElementById( 'app' );
const statusBox=document.getElementById( 'status' );

function money(cents) { return '$' + (cents / 100).toFixed(2); }
function getProduct(id) { return products.find(p => p.id ===id); }
function getStore(id) { return stores.find(s => s.id ===id); }
function calcTax(sub) { return Math.round(sub * TAX_RATE); }

function esc(text) {
  return String(text).replace(/&/g,'&amp;' ).replace(/</g,'&lt;').replace(/>/g,'&gt;' ).replace(/"/g,'&quot;' );
}

function announce(msg) {
  statusBox.textContent = '';
  setTimeout(function () { statusBox.textContent= msg; }, 50);
}

function headphoneSvg(color) {
  const c = colorHex[color] || colorHex.Black;
  return '<svg class="hp-img" viewBox="0 0 512 512" aria-hidden="true" focusable="false">' +
    '<path fill="'+ c + '" stroke="#333" stroke-width="16" stroke-linejoin="round" paint-order="stroke" d="M411.16 97.46C368.43 55.86 311.88 32 256 32S143.57 55.86 100.84 97.46C56.45 140.67 32 197 32 256c0 26.67 8.75 61.09 32.88 125.55S137 473 157.27 477.41c5.81 1.27 12.62 2.59 18.73 2.59a60.06 60.06 0 0030-8l14-8c15.07-8.82 19.47-28.13 10.8-43.35l-86.92-152.57a31.73 31.73 0 00-43.57-11.76l-13.69 8a56.49 56.49 0 00-14 11.59 4 4 0 01-7-2A114.68 114.68 0 0164 256c0-50.31 21-98.48 59.16-135.61C160 84.55 208.39 64 256 64s96 20.55 132.84 56.39C427 157.52 448 205.69 448 256a114.68 114.68 0 01-1.68 17.91 4 4 0 01-7 2 56.49 56.49 0 00-14-11.59l-13.69-8a31.73 31.73 0 00-43.57 11.76L281.2 420.65c-8.67 15.22-4.27 34.53 10.8 43.35l14 8a60.06 60.06 0 0030 8c6.11 0 12.92-1.32 18.73-2.59C375 473 423 446 447.12 381.55S480 282.67 480 256c0-59-24.45-115.33-68.84-158.54z"/>' +
    '</svg>';
}

function specList(p) {
  return '<dl class="specs">'+
    '<dt>Model</dt><dd>'+ p.model + '</dd>' +
    '<dt>Brand</dt><dd>'+ p.brand + '</dd>' +
    '<dt>Connection</dt><dd>' + (p.wireless ? 'Wireless' : 'Wired') +'</dd>'+
    '<dt>Active noise cancellation</dt><dd>' + (p.anc ? 'Yes' : 'No') +'</dd>'+
    '<dt>Battery life</dt><dd>' + p.battery +'</dd>'+
    '<dt>Available colors</dt><dd>'+ p.colors.join( ', ' ) + '</dd>' +
    '</dl>' ;
}

function fulfillText(item) {
  if(item.fulfillment === 'pickup') {
    return item.store ? 'Store pickup — '+getStore(item.store).name : 'Store pickup (store not chosen yet)' ;
  }
  if (item.fulfillment==='shipping') return 'Free shipping' ;
  return 'Not chosen yet';
}

function summaryBox(item,title, fulfillOverride) {
  const p = getProduct(item.id);
  return '<div class="summary-box"><h3>'+ title + '</h3><dl class="summary">' +
    '<dt>Product</dt><dd>'+p.name + ' ('+ p.model+ ')</dd>'+
    '<dt>Color</dt><dd>' +(item.color || 'Not chosen yet') +'</dd>'+
    '<dt>Quantity</dt><dd>'+item.qty+'</dd>'+
    '<dt>Fulfillment</dt><dd>'+(fulfillOverride || fulfillText(item))+'</dd>'+
    '<dt>Subtotal</dt><dd>'+money(p.price * item.qty)+'</dd>'+
    '</dl></div>';
}

function priceBox(item,isFinal) {
  const p=getProduct(item.id);
  const sub=p.price * item.qty;
  const t=calcTax(sub);
  const ship =item.fulfillment ==='pickup' ? 'Not applicable (pickup)' : 'Free';
  return '<div class="price-box"><h3>'+ (isFinal ? 'Order total' : 'Price summary' )+'</h3><dl class="prices">'+
    '<dt>Item subtotal</dt><dd>'+money(sub) + '</dd>'+
    '<dt>Shipping</dt><dd>'+ship + '</dd>'+
    '<dt>'+ (isFinal ? 'Tax' : 'Estimated tax') + '</dt><dd>' + money(t) + '</dd>' +
    '<dt class="total">' +(isFinal ? 'Final total' : 'Estimated total')+ '</dt><dd class="total">'+ money(sub+ t) + '</dd>' +
    '</dl></div>';
}

function head(id, text) {
  return '<p class="state-label">' + labels[id] +'</p><h2 id="heading" tabindex="-1">' +text+ '</h2>';
}

function matches(p,f) {
  if (f.maxPrice!== '' && p.price > Math.round(parseFloat(f.maxPrice) * 100))return false;
  if (f.wireless && !p.wireless)return false;
  if (f.anc && !p.anc)return false;
  return true;
}

function chip(key, text) {
  return '<li class="chip"><span>' + text +'</span>' +
    '<button type="button" class="chip-x" id="chip-'+ key+ '" data-action="removeChip" data-key="'+ key+'" aria-label="Remove filter: '+ text+ '">×</button></li>';
}

function renderS1() {
  const a=state.applied,f =state.filters;
  const list= products.filter(p => matches(p, a));
  let chips = '';
  if (a.maxPrice !=='')chips += chip('maxPrice', 'Max price: '+ money(Math.round(parseFloat(a.maxPrice) * 100)));
  if(a.wireless)chips += chip('wireless','Wireless only');
  if(a.anc)chips += chip('anc','Active noise cancellation');

  let html = '<p class="state-label">'+ labels.S1+ '</p><h2 id="heading" tabindex="-1" class="sr-only">Find your headphones.</h2>'+
    '<div class="search-bar" role="search">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7" fill="none" stroke="#0046be" stroke-width="2.5"/><path d="M15.5 15.5 L22 22" stroke="#0046be" stroke-width="2.5" stroke-linecap="round"/></svg>' +
    '<label for="search-box" class="sr-only">Search</label>' +
    '<input type="search" id="search-box" value="noise-cancelling bluetooth headphones" readonly></div>';

  if (state.cart) {
    const cp = getProduct(state.cart.id);
    html +='<p class="cart-note">In your cart: '+cp.name +', quantity '+state.cart.qty+'. '+
      '<button type="button" class="link-btn" id="goto-cart" data-action="goCart">View cart</button></p>' ;
  }

  html += '<form id="filter-form" novalidate><fieldset class="filters"><legend>Filters</legend><div class="filter-row">' +
    '<div class="field"><label for="maxPrice">Maximum price ($)</label>'+
    '<input type="number" id="maxPrice" min="0" step="any" value="' + esc(f.maxPrice)+ '"' +
    (errors.maxPrice ? ' aria-invalid="true" aria-describedby="maxPrice-error"' : '' ) + '>'+
    '<span class="error" id="maxPrice-error">' + (errors.maxPrice || '' ) + '</span></div>' +
    '<div class="check"><input type="checkbox" id="wireless"' + (f.wireless ? ' checked' : '' ) + '><label for="wireless">Wireless only</label></div>' +
    '<div class="check"><input type="checkbox" id="anc"' + (f.anc ? ' checked' : '' ) + '><label for="anc">Active noise cancellation</label></div>' +
    '<button type="submit" class="btn primary" id="apply-btn">Apply filters</button>' +
    '<button type="button" class="btn secondary" id="clear-btn" data-action="clearAll">Clear all</button>' +
    '</div></fieldset></form>' ;

  html += '<div class="chips-row"><span>Applied filters:</span><ul>' +(chips || '<li class="none">None</li>') + '</ul></div>' ;
  html +='<p class="count">Showing '+ list.length+' of '+products.length+ ' headphones</p>' ;

  if(list.length===0) {
    html+='<div class="empty"><h3>No headphones match these filters.</h3>' +
      '<p>Try a higher maximum price or remove one of the filters.</p>' +
      '<button type="button" class="btn primary" id="empty-clear" data-action="clearAll">Clear all filters</button></div>' ;
  }else {
    html +='<ul class="grid">' ;
    list.forEach(function (p) {
      html +='<li class="card">'+headphoneSvg(p.colors[0])+
        '<h3>' + p.name + '</h3><p class="price">'+ money(p.price) +'</p>' + specList(p)+
        '<button type="button" class="btn primary" id="view-'+ p.id + '" data-action="viewProduct" data-id="'+p.id+ '">View details<span class="sr-only"> for '+ p.name + '</span></button></li>';
    });
    html+='</ul>' ;
  }
  return html;
}

function renderS2() {
  const d=state.draft, p =getProduct(d.id);
  const cartP = state.cart ? getProduct(state.cart.id) : null;
  let note='' ;
  if (cartP && cartP.id !== p.id){
    note = '<p class="warn">Your cart already has '+ cartP.name + '. Your cart can hold one product at a time, so adding '+ p.name +' will replace it.</p>';
  }else if (state.editing) {
    note = '<p class="info">You are editing the item already in your cart. Saving will update it instead of adding a second one.</p>';
  }

  let label = 'Continue';
  if (d.fulfillment === 'pickup')label='Choose pickup store';
  if (d.fulfillment === 'shipping')label='Add to cart';

  const colorErr= errors.color ? ' aria-invalid="true" aria-describedby="color-error"' : '' ;
  const fulErr= errors.fulfillment ? ' aria-invalid="true" aria-describedby="fulfillment-error"' : '' ;

  const colorOpts=p.colors.map(function (c) {
    return '<label class="option"><input type="radio" name="color" id="color-'+c+ '" value="' + c+'"'+ (d.color === c ? ' checked' : '' )+colorErr+ '> '+c +'</label>';
  }).join( '' );

  let qtyOpts ='' ;
  for (let i = 1; i <=3; i++) qtyOpts+='<option value="' +i+'"' + (d.qty=== i ? ' selected' : '' ) + '>' + i+'</option>' ;

  let html=head( 'S2',p.name);
  html +='<button type="button" class="btn secondary" id="back-results" data-action="goS1">Back to results</button>';
  html +='<div class="two-col" style="margin-top:16px"><div class="stack">' +
    '<div class="panel">'+headphoneSvg(d.color || p.colors[0])+
    '<p class="price">' +money(p.price)+'</p>' + specList(p) + '<p>'+p.desc+'</p></div>' +
    summaryBox(d, 'Your selections' )+ '</div>';

  html += '<form id="detail-form" novalidate class="panel">'+note +
    '<fieldset><legend>Color</legend>' +colorOpts+'<span class="error" id="color-error">'+ (errors.color || '')+ '</span></fieldset>'+
    '<div class="field"><label for="qty">Quantity</label><select id="qty">' +qtyOpts+'</select></div>'+
    '<fieldset><legend>Fulfillment</legend>'+
    '<label class="option"><input type="radio" name="fulfillment" id="ful-pickup" value="pickup"' +(d.fulfillment ==='pickup' ? ' checked' : '' )+fulErr + '> Store pickup</label>'+
    '<label class="option"><input type="radio" name="fulfillment" id="ful-shipping" value="shipping"' +(d.fulfillment ==='shipping' ? ' checked' : '' )+fulErr + '> Free shipping</label>'+
    '<span class="error" id="fulfillment-error">' +(errors.fulfillment || '') +'</span></fieldset>'+
    '<button type="submit" class="btn primary" id="detail-next">'+label + '</button></form></div>';
  return html;
}

function renderS3() {
  const d =state.draft;
  const opts =stores.map(function (s) {
    return '<label class="option"><input type="radio" name="store" id="store-' + s.id+ '" value="' +s.id +'"' +(d.store ===s.id ? ' checked' : '' ) +
      (errors.store ? ' aria-invalid="true" aria-describedby="store-error"' : '') + '>' +
      '<span>' + s.name+'<small>'+s.address +'</small></span></label>' ;
  }).join('');

  let html = head( 'S3', 'Choose a pickup store');
  html+= '<div class="two-col"><form id="store-form" novalidate class="panel">' +
    '<fieldset><legend>Pickup store</legend>'+opts +'<span class="error" id="store-error">' + (errors.store || '')+ '</span></fieldset>'+
    '<p>Pickup is not confirmed until the availability check succeeds.</p>' +
    '<div class="btn-row"><button type="submit" class="btn primary" id="check-btn">Check pickup availability</button>' +
    '<button type="button" class="btn secondary" id="back-details" data-action="backToDetails">Back to product details</button></div></form>' +
    summaryBox(d,'Your selections')+ '</div>';
  return html;
}

function renderS4() {
  const d =state.draft;
  const sName =getStore(d.store).name;
  let html=head( 'S4', 'Pickup unavailable at ' + sName +'.');
  html +='<div class="two-col"><div class="panel"><p>Your selected headphones aren’t available for pickup here. Your product choices have been saved.</p>' +
    '<p>The price has not changed. Pick another store, or switch to free shipping yourself. Nothing is switched automatically.</p>'+
    '<div class="btn-row"><button type="button" class="btn primary" id="other-store" data-action="anotherStore">Choose another store</button>'+
    '<button type="button" class="btn secondary" id="switch-ship" data-action="switchShip">Switch to free shipping</button></div></div>'+
    summaryBox(d,'Your saved choices','Store pickup (not available at ' + sName+')' ) +'</div>';
  return html;
}

function renderS5() {
  const c = state.cart;
  let html = head('S5','Your cart' );
  if (!c) {
    html += '<div class="empty"><h3>Your cart is empty.</h3><p>Find headphones to add to your cart.</p>' +
      '<button type="button" class="btn primary" id="empty-back" data-action="goS1">Return to results</button></div>'+
      '<div class="btn-row"><button type="button" class="btn primary" id="checkout-btn" disabled>Proceed to checkout</button></div>' ;
    return html;
  }
  const p = getProduct(c.id);
  let qtyOpts='' ;
  for (let i = 1; i <=3; i++) qtyOpts+='<option value="' +i+'"' + (c.qty=== i ? ' selected' : '' ) + '>' + i+'</option>' ;

  html+='<div class="two-col"><div class="stack"><section class="cart-item">' +headphoneSvg(c.color) +
    '<div><h3>' + p.name+'</h3><dl class="summary">' +
    '<dt>Model</dt><dd>' + p.model+'</dd>' +
    '<dt>Color</dt><dd>' + c.color+'</dd>' +
    '<dt>Unit price</dt><dd>' + money(p.price)+'</dd>' +
    '<dt>Fulfillment</dt><dd>' + fulfillText(c)+'</dd></dl>' +
    '<div class="field"><label for="cart-qty">Quantity</label><select id="cart-qty">' + qtyOpts+'</select></div>' +
    (c.fulfillment==='pickup' ? '<p class="sim-note">If you change the product or color of a pickup item, you will check store availability again.</p>' : '' ) +
    '<div class="btn-row">'+
    '<button type="button" class="btn secondary" id="edit-product" data-action="editCart">Edit product/color</button>'+
    '<button type="button" class="btn secondary" id="change-ful" data-action="editCart">Change fulfillment</button>'+
    '<button type="button" class="btn secondary" id="remove-item" data-action="removeItem">Remove item</button></div></div></section></div>'+
    '<div class="stack">' + priceBox(c, false)+
    '<div class="btn-row"><button type="button" class="btn secondary" id="continue-shop" data-action="goS1">Continue shopping</button>' +
    '<button type="button" class="btn primary" id="checkout-btn" data-action="goCheckout">Proceed to checkout</button></div></div></div>' ;
  return html;
}

function field(id,label,value, extra) {
  extra= extra || '';
  const err=errors[id];
  return '<div class="field"><label for="' + id+'">'+label + '</label>'+
    '<input type="text" id="'+ id+ '" value="'+esc(value)+'" ' +extra +
    (err ? ' aria-invalid="true" aria-describedby="' + id + '-error"' : '' ) +'>' +
    '<span class="error" id="' +id+'-error">'+(err ? 'Error: ' +err : '' ) +'</span></div>' ;
}

function renderS6() {
  const c=state.cart, k =state.checkout;
  const n= Object.keys(errors).length;
  let html =head('S6', 'Checkout and order review');
  if(n > 0)html +='<div class="error-summary" role="alert">Your order was not placed. Please fix ' +n +' field'+ (n===1 ? '' : 's' ) +' below.</div>' ;

  html+= '<div class="two-col"><form id="checkout-form" novalidate class="stack">' +
    '<div class="btn-row" style="margin-top:0"><button type="button" class="btn secondary" id="demo-btn" data-action="fillDemo">Autofill my details</button></div>' +
    '<fieldset><legend>Contact</legend>' +
    field( 'name', 'Full name',k.name, 'autocomplete="name"') +
    field('email', 'Email', k.email, 'autocomplete="email" inputmode="email"')+'</fieldset>';

  if(c.fulfillment === 'shipping'){
    html +='<fieldset><legend>Shipping address</legend>' +
      field('street','Street address',k.street,'autocomplete="street-address"')+
      field('city', 'City',k.city)+
      field('state', 'State',k.state)+
      field('zip', 'ZIP code',k.zip,'inputmode="numeric"') + '</fieldset>';
  }else {
    html +='<fieldset><legend>Pickup</legend><p>Pickup at <strong>'+getStore(c.store).name+ '</strong><br>' +getStore(c.store).address +'</p></fieldset>' ;
  }

  html+= '<fieldset><legend>Payment</legend>'+
    field('card','Card number', payment.card,'autocomplete="off" inputmode="numeric" placeholder="16 digits"')+
    field('exp','Expiration (MM/YY)', payment.exp,'autocomplete="off" placeholder="MM/YY"')+
    field( 'cvc', 'Security code',payment.cvc,'autocomplete="off" inputmode="numeric" placeholder="3 digits"' ) + '</fieldset>' +
    '<div class="btn-row"><button type="button" class="btn secondary" id="back-cart" data-action="backToCart">Back to cart</button>'+
    '<button type="submit" class="btn primary" id="place-btn">Place order</button></div></form>';

  html +='<div class="stack">' + summaryBox(c,'Order summary' ) +priceBox(c, true)+ '</div></div>';
  return html;
}

function renderS7() {
  const o= state.order;
  let html = head( 'S7','Your order is complete.' );
  html+='<div class="panel"><p class="big-order">Order number: '+ o.number +'</p><dl class="summary">'+
    '<dt>Product</dt><dd>' +o.name +'</dd>'+
    '<dt>Model</dt><dd>' +o.model +'</dd>'+
    '<dt>Color</dt><dd>' +o.color +'</dd>'+
    '<dt>Quantity</dt><dd>' +o.qty +'</dd>'+
    '<dt>Total</dt><dd>' +money(o.total)+'</dd></dl>' ;
  if (o.fulfillment==='pickup'){
    html += '<h3>Pickup</h3><p>Pickup store: ' +o.store+'</p><p>We’ll send you a notification when your order is ready for pickup.</p>';
  } else {
    html+= '<h3>Shipping</h3><p>Shipping to: ' + esc(o.address) +'</p><p>Estimated delivery: 3–5 business days.</p>';
  }
  html +='<div class="btn-row"><button type="button" class="btn primary" id="new-session" data-action="newSession">Continue shopping</button></div></div>';
  return html;
}

const screens = { S1: renderS1,S2: renderS2, S3: renderS3,S4: renderS4,S5: renderS5, S6: renderS6, S7: renderS7 };

function guard() {
  const s = state.screen;
  if(['S2','S3','S4'].indexOf(s) >=0 && !state.draft.id)state.screen = 'S1' ;
  if (s === 'S3' || s ==='S4' ) { if(state.draft.fulfillment !=='pickup') state.screen ='S2'; }
  if (s=== 'S4' && !state.draft.store)state.screen= 'S3';
  if (s=== 'S6' && !state.cart)state.screen= 'S5';
  if (s=== 'S7' && !state.order)state.screen= 'S1';
}

function render(newScreen) {
  const active = document.activeElement ? document.activeElement.id : '' ;
  guard();
  app.innerHTML =screens[state.screen]();
  document.getElementById( 'cart-btn').textContent= 'Cart (' +(state.cart ? state.cart.qty : 0)+')' ;
  save();
  const bad=app.querySelector( '[aria-invalid="true"]' );
  if(bad && !newScreen){
    bad.focus();
  }else if(newScreen) {
    document.getElementById('heading').focus();
    window.scrollTo(0, 0);
  } else if (active) {
    const el =document.getElementById(active);
    if(el)el.focus();
  }
}

function go(screen) {
  state.screen=screen;
  errors={};
  render(true);
}

function openProduct(id) {
  const c=state.cart;
  if(state.draft.id !==id){
    state.draft= (c && c.id ===id) ? Object.assign({},c) : { id: id, color: '',qty: 1,fulfillment: '', store: '' };
  }
  state.editing= !!(c && c.id=== id);
  go( 'S2' );
}

function saveToCart() {
  const d =state.draft;
  state.cart= { id: d.id,color: d.color, qty: d.qty, fulfillment: d.fulfillment, store: d.fulfillment==='pickup' ? d.store : '' };
  state.editing=false;
}

function applyFilters() {
  const v=state.filters.maxPrice.trim();
  errors={};
  if(v!== '' && (isNaN(parseFloat(v)) || parseFloat(v) < 0)){
    errors.maxPrice ='Error: enter a price of $0 or more.' ;
    render();
    return;
  }
  state.applied ={ maxPrice: v,wireless: state.filters.wireless,anc: state.filters.anc };
  render();
  const n = products.filter(p => matches(p, state.applied)).length;
  announce( 'Showing ' + n+' of ' + products.length + ' headphones');
}

function clearAll() {
  state.filters = { maxPrice: '', wireless: false,anc: false };
  state.applied = { maxPrice: '', wireless: false,anc: false };
  errors={};
  render();
  announce('Filters cleared. Showing ' + products.length + ' of '+products.length+ ' headphones');
}

function submitDetails() {
  const d=state.draft;
  errors={};
  if (!d.color)errors.color = 'Error: choose a color to continue.' ;
  if (!d.fulfillment)errors.fulfillment = 'Error: choose store pickup or free shipping to continue.' ;
  if (Object.keys(errors).length) { render(); return; }
  if(d.fulfillment === 'pickup') {
    go('S3');
  } else{
    saveToCart();
    go( 'S5');
  }
}

function checkStore() {
  const d=state.draft;
  errors={};
  if(!d.store){
    errors.store = 'Error: choose a store before checking availability.';
    render();
    return;
  }
  if(getStore(d.store).available){
    saveToCart();
    go('S5' );
  } else {
    go('S4' );
  }
}

function validateCheckout() {
  const k=state.checkout,e={};
  if(!k.name.trim()) e.name ='Enter your full name.' ;
  if(!k.email.trim()) e.email ='Enter your email address.' ;
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k.email.trim())) e.email ='Enter an email like name@example.com.' ;
  if(state.cart.fulfillment ==='shipping'){
    if (!k.street.trim()) e.street ='Enter your street address.';
    if (!k.city.trim()) e.city ='Enter your city.';
    if (!k.state.trim()) e.state ='Enter your state.';
    if (!k.zip.trim()) e.zip ='Enter your ZIP code.';
    else if (!/^\d{5}$/.test(k.zip.trim())) e.zip ='ZIP code must be exactly 5 digits.';
  }
  const digits =payment.card.replace(/[\s-]/g,'' );
  if(!payment.card.trim())e.card= 'Enter a 16-digit card number.';
  else if(!/^\d{16}$/.test(digits))e.card= 'Card number must be 16 digits. Spaces are okay.';
  if(!payment.exp.trim())e.exp= 'Enter the expiration date as MM/YY.';
  else if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.exp.trim()))e.exp= 'Use MM/YY with a month from 01 to 12, like 12/30.';
  if(!payment.cvc.trim())e.cvc= 'Enter the 3-digit security code.';
  else if(!/^\d{3}$/.test(payment.cvc.trim()))e.cvc= 'Security code must be exactly 3 digits.';
  return e;
}

function placeOrder() {
  if(state.order) return;
  errors = validateCheckout();
  if(Object.keys(errors).length) { render(); return; }
  const c=state.cart, p =getProduct(c.id), k =state.checkout;
  const sub= p.price * c.qty,t=calcTax(sub);
  state.order= {
    number: 'BB-'+Math.floor(100000+ Math.random() * 900000),
    name: p.name, model: p.model, color: c.color,qty: c.qty,
    subtotal: sub,tax: t, total: sub +t,
    fulfillment: c.fulfillment,
    store: c.fulfillment==='pickup' ? getStore(c.store).name : '',
    address: c.fulfillment ==='shipping' ? k.street.trim() +', '+ k.city.trim()+ ', '+k.state.trim()+' '+ k.zip.trim() : ''
  };
  state.cart=null;
  state.checkout=freshState().checkout;
  payment={ card: '', exp: '',cvc: '' };
  go( 'S7' );
}

function resetAll() {
  state =freshState();
  payment = { card: '',exp: '', cvc: '' };
  errors ={};
  try { sessionStorage.removeItem(KEY); } catch (e) {}
  render(true);
}

const actions ={
  goS1: function () { go( 'S1'); },
  goCart: function () { go( 'S5'); },
  viewProduct: function (data) { openProduct(data.id); },
  removeChip: function (data) {
    const key = data.key;
    const empty =key === 'maxPrice' ? '' : false;
    state.filters[key] = empty;
    state.applied[key] = empty;
    errors = {};
    render();
    announce('Filter removed. Showing '+products.filter(p => matches(p, state.applied)).length+ ' of ' +products.length + ' headphones');
  },
  clearAll: clearAll,
  backToDetails: function () { go('S2' ); },
  anotherStore: function () { state.draft.store='' ; go( 'S3' ); },
  switchShip: function () {
    state.draft.fulfillment='shipping' ;
    state.draft.store='' ;
    saveToCart();
    go('S5');
  },
  editCart: function () {
    state.draft=Object.assign({},state.cart);
    state.editing =true;
    go('S2' );
  },
  removeItem: function () {
    state.cart = null;
    state.editing = false;
    render(true);
  },
  goCheckout: function () { if (state.cart)go('S6'); },
  backToCart: function () { go( 'S5' ); },
  fillDemo: function () {
    state.checkout ={ name: 'Alex Student', email: 'alex@example.com',street: '123 Maple Street',city: 'Riverton',state: 'AZ',zip: '85001' };
    payment = { card: '4242 4242 4242 4242', exp: '12/30',cvc: '123' };
    errors = {};
    render();
  },
  newSession: resetAll
};

app.addEventListener('click',function (e) {
  const btn= e.target.closest('[data-action]');
  if(!btn || btn.disabled)return;
  const fn= actions[btn.dataset.action];
  if(fn) fn(btn.dataset);
});

app.addEventListener( 'submit', function (e) {
  e.preventDefault();
  const id =e.target.id;
  if(id==='filter-form' ) applyFilters();
  if(id==='detail-form' ) submitDetails();
  if(id==='store-form' ) checkStore();
  if(id==='checkout-form' ) placeOrder();
});

app.addEventListener('change',function (e) {
  const t=e.target;
  if(state.screen === 'S1' ) {
    if (t.id ==='wireless')state.filters.wireless = t.checked;
    if (t.id ==='anc')state.filters.anc = t.checked;
    save();
  }else if(state.screen === 'S2' ){
    if (t.name=== 'color' ) state.draft.color= t.value;
    if (t.name=== 'fulfillment' ) state.draft.fulfillment= t.value;
    if (t.id=== 'qty' ) state.draft.qty= Number(t.value);
    errors = {};
    render();
  }else if(state.screen==='S3') {
    if(t.name=== 'store' ){ state.draft.store=t.value; errors ={}; render(); }
  } else if (state.screen=== 'S5'){
    if(t.id==='cart-qty') {
      state.cart.qty =Number(t.value);
      if (state.draft.id ===state.cart.id)state.draft.qty = state.cart.qty;
      render();
    }
  }
});

app.addEventListener( 'input',function (e) {
  const t= e.target;
  if(state.screen==='S1' && t.id ==='maxPrice') {
    state.filters.maxPrice= t.value;
    save();
  }
  if(state.screen ==='S6') {
    if(t.id in payment)payment[t.id]=t.value;
    else if(t.id in state.checkout)state.checkout[t.id]=t.value;
    save();
  }
});

document.getElementById('cart-btn').addEventListener( 'click', function () { go('S5' ); });
document.getElementById( 'reset-btn').addEventListener('click', resetAll);

render(false);
