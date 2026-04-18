import { useState } from "react";
import ProductForm from "./ProductForm.jsx";

export default function ProductGrid({
  products,
  onAddToCart,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [editing, setEditing] = useState(null);

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Menu</p>
          <h2>Tap image to add to cart</h2>
        </div>
      </div>

      <ProductForm
        key={editing ? editing.id : "new"}
        initial={editing}
        onSave={(form) => {
          if (editing) {
            onUpdate(editing.id, form);
            setEditing(null);
          } else {
            onCreate(form);
          }
        }}
        onCancel={() => setEditing(null)}
      />

      <div className="grid">
        {products.map((product) => (
          <article key={product.id} className="card product-card">
            <div
              className="product-thumb"
              role="button"
              tabIndex={0}
              onClick={() => onAddToCart(product)}
              onKeyDown={(e) =>
                e.key === "Enter" && onAddToCart(product)
              }
            >
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-info">
              <div>
                <p className="eyebrow">{product.category || "Item"}</p>
                <h3>{product.name}</h3>
              </div>
              <p className="price">₹{product.price}</p>
            </div>

            <div className="product-actions">
              <button
                className="ghost"
                onClick={() => setEditing(product)}
              >
                Edit
              </button>

              <button
                className="ghost danger"
                onClick={() => onDelete(product.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
