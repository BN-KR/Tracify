import { Theme } from "@clerk/types";
import { dark } from "@clerk/ui/themes";

/**
 * Clerk Appearance Configuration
 * 
 * Defines the 5to1r monochrome, 0px radius aesthetic for Clerk components.
 * Base: 'dark' theme only.
 * Customization: Total transparency, 1px gray borders (#808080).
 */
export const CLERK_APPEARANCE: Theme = {
  baseTheme: dark,
  variables: {
    colorBackground: "transparent", 
    colorInputBackground: "transparent", // Remove black background from inputs
    colorInputText: "#FFFFFF",
    colorText: "#FFFFFF",
    colorTextSecondary: "#808080",
    colorPrimary: "#FFFFFF",
    colorDanger: "#EF4444",
    colorSuccess: "#10B981",
    borderRadius: "0px",
    fontFamily: "var(--font-mono)",
  },
  elements: {
    rootBox: {
      backgroundColor: "transparent",
    },
    cardBox: {
      backgroundColor: "transparent",
      boxShadow: "none",
    },
    card: {
      backgroundColor: "transparent !important",
      border: "1px solid #808080 !important", // Enforce gray border
      borderRadius: "0px",
      boxShadow: "none",
      padding: "1rem !important",
    },
    header: "hidden", // Hide title and subtitle
    footer: {
      backgroundColor: "transparent !important",
      marginTop: "0.5rem !important",
    },
    main: {
      gap: "1rem !important",
    },
    headerTitle: "font-mono text-white text-lg uppercase tracking-widest",
    headerSubtitle: {
      color: "#808080",
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      marginTop: "0.25rem",
    },
    
    // Social Buttons
    socialButtons: {
      gap: "0.5rem !important",
    },
    socialButtonsBlockButton: {
      border: "1px solid #808080 !important", // Enforce gray border
      borderRadius: "0px !important",
      boxShadow: "none !important",
      backgroundColor: "transparent !important", // Remove black background
      height: "2.5rem !important",
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.05) !important",
      }
    },
    socialButtonsBlockButtonText: "text-white font-mono text-[13px]",
    
    // Primary Form Button
    formButtonPrimary: {
      backgroundColor: "#111111 !important",
      backgroundImage: "none !important",
      color: "#FFFFFF !important",
      border: "none !important",
      borderRadius: "0px !important",
      boxShadow: "none !important",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      fontWeight: "bold",
      fontSize: "12px",
      height: "2.5rem !important",
      marginTop: "0.5rem !important",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#222222 !important",
      }
    },
    
    // Form Fields
    formField: {
      marginBottom: "0.75rem !important",
    },
    formFieldLabel: "text-white font-mono uppercase tracking-widest text-[9px] mb-1.5 block",
    formFieldInput: {
      backgroundColor: "transparent !important", // Remove black background
      border: "1px solid #808080 !important", // Enforce gray border
      borderRadius: "0px !important",
      color: "#FFFFFF",
      boxShadow: "none !important",
      height: "2.5rem !important",
      "&:focus": {
        borderColor: "#FFFFFF",
      }
    },
    
    // Divider
    dividerRow: {
      marginTop: "0.75rem !important",
      marginBottom: "0.75rem !important",
    },
    dividerLine: {
      backgroundColor: "#808080",
      opacity: 0.3,
    },
    dividerText: "text-[#808080] font-mono uppercase tracking-[0.2em] text-[9px]",
    
    // Branding Removal
    clerkLogoBox: "hidden",
    clerkLogo: "hidden",
    branding: "hidden",
  },
};
