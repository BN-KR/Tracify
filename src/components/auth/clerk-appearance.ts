import type { Theme } from "@clerk/ui/internal";
import { dark } from "@clerk/ui/themes";

/**
 * Clerk Appearance Configuration
 * 
 * Defines the tracify monochrome, 0px radius aesthetic for Clerk components.
 * Base: 'dark' theme only.
 * Customization: Total transparency, 1px gray borders (#808080).
 */
export const CLERK_APPEARANCE: Theme = {
  theme: dark,
  variables: {
    colorBackground: "transparent", 
    colorInput: "transparent", 
    colorInputForeground: "#FFFFFF",
    colorForeground: "#FFFFFF",
    colorMutedForeground: "#FFFFFF", 
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
      backgroundImage: "none !important",
      border: "none !important", 
      borderRadius: "0px",
      boxShadow: "none !important",
      padding: "1rem !important",
    },
    header: "hidden",
    headerTitle: "font-mono text-white text-xl uppercase tracking-widest",
    headerSubtitle: "font-mono text-white/60 text-xs mt-1",
    footer: {
      backgroundColor: "transparent !important",
      backgroundImage: "none !important",
      border: "none !important",
      marginTop: "0.5rem !important",
    },
    footerAction: {
      backgroundColor: "transparent !important",
      border: "none !important",
    },
    main: {
      gap: "1rem !important",
    },

    
    // Social Buttons
    socialButtonsRoot: {
      display: "grid !important",
      gridTemplateColumns: "repeat(2, 1fr) !important",
      gap: "8px !important",
      width: "100% !important",
    },
    socialButtons: {
      display: "contents !important",
    },
    
    // REORDER: Apple -> GitHub -> Google
    socialButtonsIconButton__apple: { order: "1" },
    socialButtonsBlockButton__apple: { order: "1" },
    socialButtonsIconButton__github: { order: "2" },
    socialButtonsBlockButton__github: { order: "2" },
    socialButtonsIconButton__google: { order: "3" },
    socialButtonsBlockButton__google: { order: "3" },

    socialButtonsBlockButton: {
      width: "100% !important",
      height: "44px !important",
      flex: "1 1 auto !important",
      minWidth: "0 !important",
      maxWidth: "none !important",
      border: "1px solid #808080 !important", 
      borderRadius: "0px !important",
      boxShadow: "none !important",
      backgroundColor: "transparent !important",
      transition: "transform 160ms var(--ease-out), background-color 160ms var(--ease-out)",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.05) !important",
        borderColor: "#FFFFFF !important",
      },
      "&:active": {
        transform: "scale(0.98) !important",
      }
    },
    socialButtonsBlockButtonText: "hidden", 
    socialButtonsIconButton: {
      width: "100% !important",
      height: "44px !important",
      flex: "1 1 auto !important",
      minWidth: "0 !important",
      maxWidth: "none !important",
      aspectRatio: "auto !important",
      borderRadius: "0px !important",
      border: "1px solid #808080 !important",
    },
    badge: "hidden",
    lastAuthenticationStrategyBadge: "hidden",
    
    // Primary Form Button
    formButtonPrimary: {
      backgroundColor: "#FFFFFF !important",
      backgroundImage: "none !important",
      color: "#000000 !important",
      border: "none !important",
      borderRadius: "0px !important",
      boxShadow: "none !important",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      fontWeight: "bold",
      fontSize: "12px",
      height: "2.5rem !important",
      marginTop: "0.5rem !important",
      transition: "transform 160ms var(--ease-out), background-color 160ms var(--ease-out)",
      "&:hover": {
        backgroundColor: "#E0E0E0 !important",
      },
      "&:active": {
        transform: "scale(0.98) !important",
      }
    },
    
    // Form Fields
    formField: {
      marginBottom: "0.75rem !important",
    },
    formFieldLabel: "text-white font-mono uppercase tracking-widest text-[9px] mb-1.5 block",
    formFieldInput: {
      backgroundColor: "transparent !important",
      border: "1px solid #808080 !important",
      borderRadius: "0px !important",
      color: "#FFFFFF",
      boxShadow: "none !important",
      height: "2.5rem !important",
      transition: "border-color 200ms var(--ease-out), background-color 200ms var(--ease-out)",
      "&:focus": {
        borderColor: "#FFFFFF !important",
        backgroundColor: "rgba(255, 255, 255, 0.02) !important",
      }
    },
    
    // Divider
    dividerRow: {
      marginTop: "0.75rem !important",
      marginBottom: "0.75rem !important",
    },
    dividerLine: {
      backgroundColor: "#FFFFFF",
      opacity: 0.3,
    },
    dividerText: "text-white font-mono uppercase tracking-[0.2em] text-[9px]",
    
    // Branding Removal
    clerkLogoBox: "hidden",
    clerkLogo: "hidden",
    branding: "hidden",
    internal_devBadge: "hidden",
  },
};
