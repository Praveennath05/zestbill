import { useState } from "react";

const createEmptyProduct = () => ({
  id: crypto.randomUUID(),   // unique product id
  name: "",
  price: "",
  image: null,
  category: "",
});

export default function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || createEmptyProduct());

  function handleChange(e) {
    const { name, value, files } = e.target;

    setForm(prev => ({
      ...prev,
      [name]:
        name === "price"
          ? value === "" ? 0 : Number(value)
          : name === "image"
          ? files[0]
          : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || form.price <= -1 || !form.image) {
      alert("Name, price and image are required");
      return;
    }

    let imageUrl = form.image;
    if (form.image instanceof File) {
      imageUrl = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(form.image);
      });
    }

    const productToSave = {
      ...form,
      id: form.id || crypto.randomUUID(), // safety
      image: imageUrl,
    };

    console.log("🟢 Saving product:", productToSave);

    onSave(productToSave);
    if (!initial) setForm(createEmptyProduct());
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="field">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
      </div>

      <div className="field">
        <label>Price (₹)</label>
        <input type="number" name="price" value={form.price} onChange={handleChange} />
      </div>

      <div className="field">
        <label>Image</label>
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
      </div>

    

      <div className="field">
        <label>Category</label>
        <input name="category" value={form.category} onChange={handleChange} />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="primary" type="submit">
          {initial ? "Update" : "Add product"}
        </button>
      </div>
    </form>
  );
}
