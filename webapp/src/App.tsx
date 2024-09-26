import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import SupportTickets from "./components/SupportTickets";

const queryClient = new QueryClient();

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}.
    </Typography>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" sx={{               mb: 2, 
              bgcolor: 'lightgrey', 
              p: 2, 
              borderRadius: 1,
              textAlign: 'center'
            }}>
            My Support Tickets Platform
          </Typography>
          <Box sx={{ mb: 2 }}>
            <SupportTickets />
          </Box>
          <Copyright />
        </Box>
      </Container>
    </QueryClientProvider>
  );
}
