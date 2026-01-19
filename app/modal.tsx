import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, spacing, borderRadius, typography } from "@/constants/theme";

export default function ModalScreen() {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Modal</Text>
          <Text style={styles.description}>
            This is an example modal. You can customize it as needed.
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    alignItems: "center",
    minWidth: 300,
  },
  title: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.lg,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 100,
  },
  closeButtonText: {
    ...typography.headline,
    color: colors.textInverse,
    textAlign: "center",
  },
});