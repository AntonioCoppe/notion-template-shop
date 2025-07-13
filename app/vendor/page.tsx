"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/session-provider";
import { vendorApiCall } from "@/lib/api-client";
import Stripe from "stripe";
import Link from "next/link";

interface Template {
  id: string;
  title: string;
  price: number;
  notion_url: string;
  created_at: string;
}

interface Vendor {
  id: string;
  stripe_account_id: string | null;
}

export default function VendorDashboard() {
  const { user, loading, supabase } = useSupabase();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [acctStatus, setAcctStatus] = useState<Stripe.Account | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    price: "",
    notion_url: "",
    file: null as File | null,
  });
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState({ title: "", price: "", notion_url: "" });
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchVendorData = useCallback(async () => {
    if (!user) return;
    
    console.log("Fetching vendor data for user:", user?.id);
    console.log("User object structure:", {
      id: user?.id,
      email: user?.email,
      role: user?.user_metadata?.role,
      metadata: user?.user_metadata
    });
    
    try {
      // First, let's test if the vendors table exists and what its structure is
      console.log("Testing vendors table access...");
      const { data: testData, error: testError } = await supabase
        .from("vendors")
        .select("*")
        .limit(1);
      
      console.log("Vendors table test result:", { data: testData, error: testError });
      
      const { data, error } = await supabase
        .from("vendors")
        .select("id, user_id, stripe_account_id")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching vendor:", error);
        return;
      }

      if (data) {
        console.log("Found existing vendor:", data);
        setVendor(data);
      } else {
        // Create vendor record if it doesn't exist
        console.log("Creating vendor record for user:", user?.id);
        console.log("User object:", user);
        
        const { data: newVendor, error: createError } = await supabase
          .from("vendors")
          .insert({ 
            user_id: user?.id,
            country: 'US' // Add required country field with default value
          })
          .select()
          .single();

        console.log("Vendor creation result:", { data: newVendor, error: createError });

        if (createError) {
          console.error("Error creating vendor:", createError);
          console.error("Error type:", typeof createError);
          console.error("Error constructor:", createError.constructor.name);
          console.error("Error keys:", Object.keys(createError));
          console.error("Error stringified:", JSON.stringify(createError, null, 2));
          console.error("Error message:", createError.message);
          console.error("Error details:", createError.details);
          console.error("Error hint:", createError.hint);
          console.error("Error code:", createError.code);
          console.error("Full error object:", createError);
          return;
        }

        console.log("Successfully created vendor:", newVendor);
        setVendor(newVendor);
      }
    } catch (error) {
      console.error("Unexpected error in fetchVendorData:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Error message:", (error as Error)?.message);
      console.error("Full error:", error);
    }
  }, [user, supabase]);

  const fetchTemplates = useCallback(async () => {
    if (!vendor) return;
    
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      return;
    }

    setTemplates(data || []);
  }, [vendor, supabase]);

  // Enhanced access control with loading state
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/sign-in?redirect=/vendor");
        return;
      }
      
      if (user.user_metadata?.role !== "vendor") {
        setAccessDenied(true);
        return;
      }
    }
  }, [user, loading, router]);

  // Fetch vendor data
  useEffect(() => {
    if (user && user.user_metadata?.role === "vendor") {
      fetchVendorData();
    }
  }, [user, fetchVendorData]);

  // Fetch templates when vendor is available
  useEffect(() => {
    if (vendor) {
      fetchTemplates();
    }
  }, [vendor, fetchTemplates]);

  // After you've fetched `vendor` (and it has an account ID), load its Stripe status:
  useEffect(() => {
    if (vendor?.stripe_account_id) {
      fetch(`/api/stripe/account-status?acct=${vendor.stripe_account_id}`)
        .then((res) => res.json())
        .then((acct: Stripe.Account) => setAcctStatus(acct))
        .catch((err) => console.error("Failed loading account status", err));
    }
  }, [vendor]);

  // Force session refresh if role is missing (fixes post-confirmation stale session)
  useEffect(() => {
    if (user && !user.user_metadata?.role) {
      supabase.auth.refreshSession().then(() => window.location.reload());
    }
  }, [user, supabase]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access the vendor dashboard.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Don't render the main content until we have a user and they're a vendor
  if (!user || user.user_metadata?.role !== "vendor") {
    return null;
  }

  const connectStripe = async () => {
    setConnectingStripe(true);
    try {
      console.log("Connecting Stripe for vendor:", vendor?.id);
      const response = await vendorApiCall("/api/stripe/connect", {
        method: "POST",
        body: JSON.stringify({ vendorId: vendor?.id }),
      });
      const { url } = await response.json();
      console.log("Stripe onboarding URL received:", url);
      window.location.href = url;
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to connect Stripe. Please try again.");
      }
    } finally {
      setConnectingStripe(false);
    }
  };

  const addTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    let imageUrl = "";
    if (newTemplate.file) {
      const { error: uploadError } = await supabase.storage
        .from('template-images')
        .upload(newTemplate.file.name, newTemplate.file, {
          cacheControl: '3600',
          upsert: false,
        });
      console.log('Upload error:', uploadError);
      if (uploadError) {
        alert("Failed to upload image.");
        return;
      }
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('template-images')
        .getPublicUrl(newTemplate.file.name);
      imageUrl = publicUrlData?.publicUrl || "";
      if (imageUrl && !imageUrl.includes('/object/public/')) {
        imageUrl = imageUrl.replace('/object/', '/object/public/');
      }
      console.log('Image public URL:', imageUrl); // Debug log
      if (!imageUrl) {
        alert("Failed to get public image URL.");
        return;
      }
    }

    const { error } = await supabase
      .from("templates")
      .insert({
        vendor_id: vendor.id,
        title: newTemplate.title,
        price: parseFloat(newTemplate.price),
        notion_url: newTemplate.notion_url,
        img: imageUrl,
      });

    if (error) {
      alert("Failed to add template. Please try again.");
      return;
    }

    setNewTemplate({ title: "", price: "", notion_url: "", file: null });
    setShowAddForm(false);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) {
      alert("Failed to delete template. Please try again.");
      return;
    }
    fetchTemplates();
  };

  const startEdit = (template: Template) => {
    setEditingTemplateId(template.id);
    setEditTemplate({
      title: template.title,
      price: template.price.toString(),
      notion_url: template.notion_url,
    });
  };

  const cancelEdit = () => {
    setEditingTemplateId(null);
    setEditTemplate({ title: "", price: "", notion_url: "" });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplateId) return;
    const { error } = await supabase
      .from("templates")
      .update({
        title: editTemplate.title,
        price: parseFloat(editTemplate.price),
        notion_url: editTemplate.notion_url,
      })
      .eq("id", editingTemplateId);
    if (error) {
      alert("Failed to update template. Please try again.");
      return;
    }
    setEditingTemplateId(null);
    setEditTemplate({ title: "", price: "", notion_url: "" });
    fetchTemplates();
  };

  // Main dashboard content restyled
  return (
    <main className="container min-h-screen flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <Link href="/" className="logo mb-8">
          <span className="logo-icon">
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
          </span>
          <span className="logo-text">Notion Template Shop</span>
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-center">Vendor Dashboard</h1>

        {/* Stripe Connect Section */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 w-full">
          <h2 className="text-xl font-semibold mb-4">Stripe Integration</h2>
          {vendor?.stripe_account_id ? (
            acctStatus?.capabilities?.transfers === "active" ? (
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓ Connected to Stripe</span>
                <span className="text-sm text-gray-500">
                  Account ID: {vendor.stripe_account_id}
                </span>
              </div>
            ) : (
              <div>
                <p className="text-red-600 mb-2">
                  ⚠️ Your Stripe account isn&apos;t fully onboarded.
                </p>
                <button
                  onClick={connectStripe}
                  disabled={connectingStripe}
                  className={`bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 ${
                    connectingStripe ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {connectingStripe
                    ? "Opening Stripe…"
                    : "Finish Stripe Onboarding"}
                </button>
              </div>
            )
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Connect your Stripe account to start receiving payments for your templates.
              </p>
              <button
                onClick={connectStripe}
                disabled={connectingStripe}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  connectingStripe ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {connectingStripe ? "Connecting..." : "Connect Stripe"}
              </button>
            </div>
          )}
        </div>

        {/* Templates Section */}
        <div className="mb-8 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Templates</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              {showAddForm ? "Cancel" : "Add Template"}
            </button>
          </div>

          {/* Add Template Form */}
          {showAddForm && (
            <form onSubmit={addTemplate} className="bg-gray-50 p-6 rounded-lg mb-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Template Title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  required
                  className="border px-3 py-2 rounded text-black w-full"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price ($)"
                  value={newTemplate.price}
                  onChange={(e) => setNewTemplate({ ...newTemplate, price: e.target.value })}
                  required
                  className="border px-3 py-2 rounded text-black w-full"
                />
                <input
                  type="url"
                  placeholder="Notion Share URL"
                  value={newTemplate.notion_url}
                  onChange={(e) => setNewTemplate({ ...newTemplate, notion_url: e.target.value })}
                  required
                  className="border px-3 py-2 rounded text-black w-full"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewTemplate({ ...newTemplate, file: e.target.files?.[0] || null })}
                  required
                  className="border px-3 py-2 rounded text-black w-full"
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Add Template
              </button>
            </form>
          )}

          {/* Templates List */}
          {templates.length > 0 ? (
            <div className="grid gap-4 w-full">
              {templates.map((template) => (
                <div key={template.id} className="border p-4 rounded-lg w-full">
                  {editingTemplateId === template.id ? (
                    <form onSubmit={handleEditSubmit} className="space-y-2 w-full">
                      <input
                        type="text"
                        value={editTemplate.title}
                        onChange={e => setEditTemplate({ ...editTemplate, title: e.target.value })}
                        required
                        className="border px-3 py-2 rounded text-black w-full"
                        placeholder="Template Title"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editTemplate.price}
                        onChange={e => setEditTemplate({ ...editTemplate, price: e.target.value })}
                        required
                        className="border px-3 py-2 rounded text-black w-full"
                        placeholder="Price ($)"
                      />
                      <input
                        type="url"
                        value={editTemplate.notion_url}
                        onChange={e => setEditTemplate({ ...editTemplate, notion_url: e.target.value })}
                        required
                        className="border px-3 py-2 rounded text-black w-full"
                        placeholder="Notion Share URL"
                      />
                      <div className="flex gap-2 mt-2 w-full">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">Save</button>
                        <button type="button" onClick={cancelEdit} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 w-full">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <h3 className="font-semibold text-lg">{template.title}</h3>
                        <p className="text-gray-600">${template.price}</p>
                        <a
                          href={template.notion_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          View Template
                        </a>
                      </div>
                      <div className="flex flex-col gap-2 items-end w-full">
                        <span className="text-sm text-gray-500">{new Date(template.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => startEdit(template)}
                          className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 text-xs mt-2 w-full"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs w-full"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8 w-full">
              No templates yet. Add your first template to get started!
            </p>
          )}
        </div>
      </div>
    </main>
  );
} 