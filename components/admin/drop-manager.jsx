"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function DropManager() {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    drop_date: "",
    starting_price: "",
    quantity: "",
    image_url: "",
  });

  useEffect(() => {
    fetchDrops();
    fetchProducts();
  }, []);

  const fetchDrops = async () => {
    try {
      const { data, error } = await supabase
        .from("drops")
        .select(
          `
          *,
          drop_products (
            id,
            drop_price,
            quantity,
            products (
              id,
              name,
              slug,
              image_url
            )
          )
        `
        )
        .order("drop_date", { ascending: false });

      if (error) throw error;
      setDrops(data || []);
    } catch (error) {
      toast.error("Error fetching drops");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, price, image_url")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductSelection = (productId, isSelected) => {
    if (isSelected) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dropData = {
        ...formData,
        starting_price: parseFloat(formData.starting_price),
        quantity: parseInt(formData.quantity),
        is_active: true,
      };

      const { error } = await supabase
        .from("drops")
        .insert([dropData])
        .select()
        .single();

      if (error) throw error;

      // Add selected products to the drop
      if (selectedProducts.length > 0) {
        const dropProducts = selectedProducts.map((productId) => ({
          drop_id: drop.id,
          product_id: productId,
          drop_price: parseFloat(formData.starting_price),
          quantity: Math.floor(
            parseInt(formData.quantity) / selectedProducts.length
          ),
        }));

        const { error: dropProductsError } = await supabase
          .from("drop_products")
          .insert(dropProducts);

        if (dropProductsError) throw dropProductsError;
      }

      toast.success("Drop created successfully");
      setIsDialogOpen(false);
      setSelectedProducts([]);
      setFormData({
        name: "",
        description: "",
        drop_date: "",
        starting_price: "",
        quantity: "",
        image_url: "",
      });
      fetchDrops();
    } catch (error) {
      toast.error("Error creating drop");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this drop?")) {
      try {
        // Delete drop products first
        await supabase.from("drop_products").delete().eq("drop_id", id);

        // Then delete the drop
        const { error } = await supabase.from("drops").delete().eq("id", id);

        if (error) throw error;
        toast.success("Drop deleted successfully");
        fetchDrops();
      } catch (error) {
        toast.error("Error deleting drop");
      }
    }
  };

  if (loading) {
    return <div>Loading drops...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Drops</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Drop</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Drop</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Drop Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="drop_date">Drop Date</Label>
                <Input
                  id="drop_date"
                  name="drop_date"
                  type="datetime-local"
                  value={formData.drop_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="starting_price">Starting Price (₦)</Label>
                  <Input
                    id="starting_price"
                    name="starting_price"
                    type="number"
                    value={formData.starting_price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label>Select Products for this Drop</Label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded p-2">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) =>
                          handleProductSelection(product.id, e.target.checked)
                        }
                      />
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span className="text-sm">{product.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Create Drop
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {drops.map((drop) => (
          <div key={drop.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{drop.name}</h3>
                <p className="text-gray-600">{drop.description}</p>
                <p className="text-sm text-gray-500">
                  Drop Date: {new Date(drop.drop_date).toLocaleString()}
                </p>
                <p className="text-lg font-bold mt-2">
                  Starting at ₦{drop.starting_price?.toLocaleString()}
                </p>
                {drop.drop_products && drop.drop_products.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      Products in this drop:
                    </p>
                    <div className="flex gap-2 mt-1">
                      {drop.drop_products.slice(0, 3).map((dropProduct) => (
                        <img
                          key={dropProduct.id}
                          src={dropProduct.products.image_url}
                          alt={dropProduct.products.name}
                          className="w-8 h-8 object-cover rounded"
                          title={dropProduct.products.name}
                        />
                      ))}
                      {drop.drop_products.length > 3 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{drop.drop_products.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(drop.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
