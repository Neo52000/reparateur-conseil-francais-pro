
import React, { useState } from "react";
import { usePartsCatalog } from "@/hooks/usePartsCatalog";
import { Button } from "@/components/ui/button";

const PartsMarketplace = () => {
  const { parts, loading, createPart } = usePartsCatalog();
  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    part_number: "",
    description: "",
    price: "",
    image_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      brand: form.brand,
      model: form.model,
      part_number: form.part_number,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url,
    };
    await createPart(payload);
    setForm({ name: "", brand: "", model: "", part_number: "", description: "", price: "", image_url: "" });
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Marketplace pièces détachées</h2>
      <form className="mb-3 space-y-2" onSubmit={handleSubmit}>
        <input className="border rounded p-1 w-full" name="name" placeholder="Nom" value={form.name} onChange={handleChange} required />
        <input className="border rounded p-1 w-full" name="brand" placeholder="Marque" value={form.brand} onChange={handleChange} />
        <input className="border rounded p-1 w-full" name="model" placeholder="Modèle" value={form.model} onChange={handleChange} />
        <input className="border rounded p-1 w-full" name="part_number" placeholder="Numéro de pièce" value={form.part_number} onChange={handleChange} />
        <input className="border rounded p-1 w-full" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input className="border rounded p-1 w-full" name="price" placeholder="Prix (€)" type="number" value={form.price} onChange={handleChange} />
        <input className="border rounded p-1 w-full" name="image_url" placeholder="Image URL" value={form.image_url} onChange={handleChange} />
        <Button type="submit" className="w-full">Ajouter la pièce</Button>
      </form>
      {loading ? <div>Chargement...</div> : (
        <ul>
          {parts.map((p) => (
            <li key={p.id} className="border-b py-1">
              <span className="font-semibold">{p.name}</span>
              {p.brand && <> • <span>{p.brand}</span></>}
              {p.price && <> • <span>{p.price} €</span></>}
              {p.model && <> • <span className="text-xs">{p.model}</span></>}
              {p.description && <div className="text-xs text-gray-600">{p.description}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default PartsMarketplace;
