import { borderRadius, colors, shadows, spacing } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { Tabs, useRouter } from "expo-router";
import { CalendarDays, LayoutDashboard, Plus, Receipt, User } from "lucide-react-native";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabBarIcon({ 
  icon: Icon, 
  color, 
  focused 
}: { 
  icon: typeof LayoutDashboard; 
  color: string; 
  focused: boolean;
}) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

function FloatingActionButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/bill/create");
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        { bottom: 70 + (Platform.OS === 'ios' ? insets.bottom : 16) }
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
      testID="fab-add-bill"
    >
      <Plus size={24} color={colors.textInverse} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarShowLabel: true,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Overview",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon icon={LayoutDashboard} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="bills"
          options={{
            title: "Bills",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon icon={Receipt} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon icon={CalendarDays} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon icon={User} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    height: Platform.OS === 'ios' ? 88 : 64,
  },
  tabBarItem: {
    paddingTop: spacing.xs,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: spacing.xxs,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 0,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: '600' as const,
    fontSize: 17,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 28,
    borderRadius: borderRadius.md,
  },
  iconContainerActive: {
    backgroundColor: colors.accentMuted,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
    ...shadows.colored(colors.accent),
    zIndex: 100,
  },
});
