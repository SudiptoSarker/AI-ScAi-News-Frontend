import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

type Props = {
  title: string;
};

const Header: React.FC<Props> = ({ title }) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/msgraph-user-profile")
      .then((response) => response.json())
      .then((data) => setProfile(data));
  }, []);

  return (
    <AppBar position="static" sx={{ bgcolor: "#333" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
        {profile && (
          <Box sx={{ fontStyle: "italic", color: "white" }}>
            {profile.displayName ? profile.displayName : profile.mail ? profile.mail : ""}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
