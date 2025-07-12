"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { toast, Toaster } from "sonner";
import { apiFetch } from "@/lib/api";
import LayoutDashboard from "@/components/LayoutDashboard";
import { Button } from "@/components/ui/button";
import useIPFSUpload from "@/hooks/useIPFSUpload";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Contact phone must be at least 10 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
});

export default function ManageCompaniesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadCompanyFiles, loading: ipfsLoading } = useIPFSUpload();


  const form = useForm<z.infer<typeof formSchema>>({  
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // console.log("Values:", values);
      // const ipfsResult = await uploadCompanyFiles(values);
      // console.log("IPFS Result:", ipfsResult);
      

      const response = await apiFetch<{ success?: boolean; message?: string; error?: string; data?: any }>(
        "/companies/createcompany",
        {
          method: "POST",
          body: JSON.stringify({
            name: values.name,
            description: values.description,
            contactEmail: values.contactEmail,
            contactPhone: values.contactPhone,
            address: values.address,
          })
        }
      );

      console.log("API Response:", response);
      if (response.success) {
        form.reset();
        toast.success(`Company "${response.data.name}" created successfully!`);
      } else if (response.error) {
        toast.error(`Failed to create company: ${response.error}`);
      } else {
        toast.error("Failed to create company: Unknown error occurred");
      }
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error(`Failed to create company: ${error.message || "Network or server error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster /> {/* Add Toaster to render the toast notifications */}
      <LayoutDashboard>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Manage Companies</h1>
          <Card>
            <CardHeader>
              <CardTitle>Add New Company</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input className="pl-10" placeholder="Enter company name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input className="pl-10" type="email" placeholder="Enter contact email" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input className="pl-10" placeholder="Enter contact phone" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input className="pl-10" placeholder="Enter company address" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Company"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </LayoutDashboard>
    </>
  );
}