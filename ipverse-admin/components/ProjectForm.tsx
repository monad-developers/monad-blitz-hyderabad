"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Calendar, Upload, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";

interface ProjectFormProps {
  onSubmit: (projectData: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

export default function ProjectForm({
  onSubmit,
  initialData,
  isEditing = false,
}: ProjectFormProps) {
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    ipType: initialData?.ipType || "",
    totalTokens: initialData?.totalTokens || "",
    tokenPrice: initialData?.tokenPrice || "",
    FundingGoal: initialData?.FundingGoal || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    expectedReturns: initialData?.expectedReturns || "",
    riskLevel: initialData?.riskLevel || "",
    images: initialData?.images || [],
    documents: initialData?.documents || [],
  });
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({
          ...prev,
          images: [result],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, images: [] }));
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiFetch<{ success: boolean; data: Array<{ id: string; name: string }> }>(
          "/companies/names-and-ids"
        );
        if (response.success) {
          setCompanies(response.data);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      alert("Please select a company");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      ...formData,
      companyId: selectedCompanyId,
      totalTokens: Number(formData.totalTokens),
      tokenPrice: Number(formData.tokenPrice),
      FundingGoal: Number(formData.FundingGoal),
      expectedReturns: Number(formData.expectedReturns),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    console.log("payload is formdata is here :", payload);

    await onSubmit(payload);
    setIsSubmitting(false);
    if (!isEditing) {
      // Reset form for new projects
      setFormData({
        title: "",
        description: "",
        category: "",
        ipType: "",
        totalTokens: "",
        tokenPrice: "",
        FundingGoal: "",
        startDate: "",
        endDate: "",
        expectedReturns: "",
        riskLevel: "",
        images: [],
        documents: [],
      });
      setImagePreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
          Select Company *
        </label>
        <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Name */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter project name"
          />
        </div>

        {/* Token Price */}
        <div>
          <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700 mb-2">
            Token Price (ETH) *
          </label>
          <input
            type="number"
            id="tokenPrice"
            name="tokenPrice"
            required
            step="0.001"
            value={formData.tokenPrice}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="0.001"
          />
        </div>

        {/* Total Tokens */}
        <div>
          <label htmlFor="totalTokens" className="block text-sm font-medium text-gray-700 mb-2">
            Total Tokens *
          </label>
          <input
            type="number"
            id="totalTokens"
            name="totalTokens"
            required
            value={formData.totalTokens}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="1000"
          />
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <div className="relative">
            <input
              type="date"
              id="startDate"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <div className="relative">
            <input
              type="date"
              id="endDate"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <Select
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            value={formData.category}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Music",
                "Games",
                "Characters",
                "Art",
                "Patents",
                "Antiques",
                "Technology",
                "Culture",
              ].map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* IP Type */}
        <div>
          <label htmlFor="ipType" className="block text-sm font-medium text-gray-700 mb-2">
            IP Type *
          </label>
          <input
            type="text"
            id="ipType"
            name="ipType"
            required
            value={formData.ipType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter IP type"
          />
        </div>

        {/* Funding Goal */}
        <div>
          <label htmlFor="FundingGoal" className="block text-sm font-medium text-gray-700 mb-2">
            Funding Goal *
          </label>
          <input
            type="number"
            id="FundingGoal"
            name="FundingGoal"
            required
            value={formData.FundingGoal}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter funding goal"
          />
        </div>

        {/* Expected Returns */}
        <div>
          <label htmlFor="expectedReturns" className="block text-sm font-medium text-gray-700 mb-2">
            Expected Returns *
          </label>
          <input
            type="number"
            id="expectedReturns"
            name="expectedReturns"
            required
            value={formData.expectedReturns}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter expected returns"
          />
        </div>

        {/* Risk Level */}
        <div>
          <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Risk Level *
          </label>
          <Select
            onValueChange={(value) => setFormData((prev) => ({ ...prev, riskLevel: value }))}
            value={formData.riskLevel}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a risk level" />
            </SelectTrigger>
            <SelectContent>
              {["low", "medium", "high"].map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Describe your IP tokenization project..."
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Project preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="image" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">Upload project image</span>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : isEditing ? "Update Project" : "Create Project"}
        </button>
      </div>
    </form>
  );
}