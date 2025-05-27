
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Save, ListPlus } from "lucide-react";

const settingsFormSchema = z.object({
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }).regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format." }).or(z.literal("")),
  alertOnLowWater: z.boolean().default(false),
  alertOnLowFertilizer: z.boolean().default(false),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// Mock global settings - in a real app, this would come from a user profile / database
const mockGlobalSettings = {
  phoneNumber: "09553471926", // From image
  alertOnLowWater: true,
  alertOnLowFertilizer: true,
};

export function SettingsForm() {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      phoneNumber: mockGlobalSettings.phoneNumber,
      alertOnLowWater: mockGlobalSettings.alertOnLowWater,
      alertOnLowFertilizer: mockGlobalSettings.alertOnLowFertilizer,
    },
  });

  async function onSubmit(values: SettingsFormValues) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Saving global settings:", values);
    toast({
      title: "Configuration Saved",
      description: "Your SMS notification settings have been updated.",
    });
    // Update mockGlobalSettings for demonstration purposes if needed
    mockGlobalSettings.phoneNumber = values.phoneNumber;
    mockGlobalSettings.alertOnLowWater = values.alertOnLowWater;
    mockGlobalSettings.alertOnLowFertilizer = values.alertOnLowFertilizer;
  }

  const handleAddSampleData = () => {
    toast({
      title: "Sample Data Added (Simulated)",
      description: "Mock devices and sensor readings have been populated.",
    });
    // Here you could trigger an action to populate mock data if it's not already present
    // or to reset to a sample state.
  };

  return (
    <>
      <Card className="bg-[hsl(var(--settings-card-background))] text-[hsl(var(--settings-card-foreground))] shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">SMS Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g. +1234567890"
                        {...field}
                        className="bg-card/50 border-border focus:bg-card"
                      />
                    </FormControl>
                    <FormDescription className="text-[hsl(var(--settings-card-foreground))] opacity-70">
                      Where you&apos;ll receive alert messages
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alertOnLowWater"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 shadow-sm bg-card/20">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Alert on low water level</FormLabel>
                      <FormDescription className="text-[hsl(var(--settings-card-foreground))] opacity-70">
                        Get notified when water reservoir needs refilling
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alertOnLowFertilizer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 shadow-sm bg-card/20">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Alert on low fertilizer level</FormLabel>
                      <FormDescription className="text-[hsl(var(--settings-card-foreground))] opacity-70">
                        Get notified when fertilizer reservoir needs refilling
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {/* Buttons are moved outside this card */}
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-4">
        <Button
          onClick={handleAddSampleData}
          variant="default"
          className="w-full bg-[hsl(var(--button-secondary-background))] text-[hsl(var(--button-secondary-foreground))] hover:bg-[hsl(var(--button-secondary-background))]/90"
        >
          <ListPlus className="mr-2 h-5 w-5" /> Add Sample Data
        </Button>
        <Button
          type="submit"
          form="settingsForm" // Associate with the form in the Card above
          onClick={form.handleSubmit(onSubmit)} // Trigger form submission
          variant="default"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={form.formState.isSubmitting}
        >
          <Save className="mr-2 h-5 w-5" /> {form.formState.isSubmitting ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </>
  );
}
