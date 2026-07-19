import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// validation
import { contactSchema } from "../Validation/Contact-Us/ContactSchema";
// reusable components
import FormContainer from "../Components/form/FormContainer";
import FormInput from "../Components/form/FormInput";
import FormButton from "../Components/form/FormButton";

export default function ContactUsPage() {

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {

    try {
      console.log("Contact form data →", data);

      // 🔴 BACKEND PLACEHOLDER
      // const response = await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });

      // const result = await response.json();

      // if (!response.ok) {
      //   throw new Error(result.message || "Failed to send message");
      // }

      // MOCK delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success("Message sent! We'll get back to you soon.");
      reset(); // clear form fields after success

    } catch (err) {
      // ❌ Server error toast
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <FormContainer
      title="Contact Us"
      subtitle="We would love to hear from you"
    >

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

        {/* Name */}
        <FormInput
          name="name"
          control={control}
          label="Full Name"
          type="text"
          placeholder="Your name"
          errors={errors}
        />

        {/* Email */}
        <FormInput
          name="email"
          control={control}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          errors={errors}
        />

        {/* Message */}
        <FormInput
          name="message"
          control={control}
          label="Message"
          type="text"
          placeholder="Write your message..."
          errors={errors}
          multiline={true} // if your FormInput supports textarea
        />

        {/* Button */}
        <FormButton
          text="Send Message"
          loadingText="Sending..."
          isLoading={isSubmitting}
        />
      </form>
    </FormContainer>
  );
}