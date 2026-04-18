export default function Cart({
  items,
  totals,
  onIncrement,
  onDecrement,
  onClear,
  onPay,
  onPrint,
}) {

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Bill</p>
          <h2>Your cart</h2>
        </div>
       
      </div>

      <div className="card cart-card">
        {!items.length && <p className="muted">No items yet.</p>}

        {items.map(item => (
          <div key={item.id} className="cart-row">
            <div>
              <p className="strong">{item.name}</p>
              <p className="muted">₹{item.price} each</p>
            </div>

            <div className="cart-qty">
              <button onClick={() => onDecrement(item.id)}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => onIncrement(item.id)}>+</button>
            </div>

            <p className="strong">
              ₹{Number(item.price) * item.qty}
            </p>
          </div>
        ))}

        {!!items.length && (
          <>
            <div className="totals">
              <div>
                <span>Subtotal</span>
                <span>₹{totals.subtotal}</span>
              </div>
              <div>
                <span>SGST + CGST </span>
                <span>₹{totals.tax}</span>
              </div>
              <div className="total-row">
                <span>Total</span>
                <span className="strong">₹{totals.total}</span>
              </div>
            </div>

            <div className="actions">
              <button className="primary" onClick={onPay}>
                Pay now
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
