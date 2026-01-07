import type { ReactNode } from "react";
import { Box, Container } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
