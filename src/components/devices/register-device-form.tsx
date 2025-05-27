"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, CheckCircle } from 'lucide-react';

const registerDeviceFormSchema = z.object({
  deviceName: z.string().min(3, { message: "Device name must be at least 3 characters." }),
  uniqueId: z.string().regex(/^YUCCA-[A-Z0-9]{3}-[A-Z0-9]{3}$/, { message: "Invalid Unique ID format (e.g., YUCCA-ABC-123)." }),
  useDefaultSettings: z.boolean().default(false).optional(),
});

type RegisterDeviceFormValues = z.infer<typeof registerDeviceFormSchema>;

export function RegisterDeviceForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterDeviceFormValues>({
    resolver: zodResolver(registerDeviceFormSchema),
    defaultValues: {
      deviceName: "",
      uniqueId: "",
      useDefaultSettings: true,
    },
  });

  async function onSubmit(values: RegisterDeviceFormValues) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Registering device:", values);
    toast({
      title: "Device Registered!",
      description: `Device "${values.deviceName}" has been added to your account.`,
    });
    // In a real app, you might get back the new device ID and redirect to its page.
    router.push("/devices"); 
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Smartphone className="mr-3 h-7 w-7 text-primary" />
          Register New Yucca Device
        </CardTitle>
        <CardDescription>
          Enter the details for your new Yucca device to link it to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Living Room Orchid" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your device a friendly name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uniqueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unique Device ID</FormLabel>
                  <FormControl>
                    <Input placeholder="YUCCA-XXX-YYY" {...field} />
                  </FormControl>
                  <FormDescription>
                    Found on the device packaging or sticker.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="useDefaultSettings"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Use default settings
                    </FormLabel>
                    <FormDescription>
                      Start with recommended settings. You can change them later.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Registering..." : "Register Device"}
              <CheckCircle className="ml-2 h-5 w-5"/>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
