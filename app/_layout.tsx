import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MirrorProvider } from "@/providers/MirrorProvider";
import { colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="bill/create"
        options={{
          presentation: "modal",
          headerTitle: "Add Bill",
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary },
        }}
      />
      <Stack.Screen
        name="bill/[id]"
        options={{
          presentation: "modal",
          headerTitle: "Edit Bill",
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary },
        }}
      />
      <Stack.Screen
        name="savings/create"
        options={{
          presentation: "modal",
          headerTitle: "New Savings Goal",
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary },
        }}
      />
      <Stack.Screen
        name="savings/[id]"
        options={{
          presentation: "modal",
          headerTitle: "Edit Goal",
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MirrorProvider>
          <RootLayoutNav />
        </MirrorProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}