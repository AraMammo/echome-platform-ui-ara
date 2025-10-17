export const useToast = () => ({
  toast: (options: {
    title?: string;
    description?: string;
    variant?: string;
  }) => console.log("Toast:", options),
});
