import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../../../lib/theme";
import { Kicker, cardStyle } from "./ui";
import type { NewAtomicInput } from "../../../types/atomic";

export default function AddAtomicForm({
  onAdd,
}: {
  onAdd: (input: NewAtomicInput) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [oldB, setOldB] = useState("");
  const [newB, setNewB] = useState("");

  const reset = () => {
    setName("");
    setTrigger("");
    setOldB("");
    setNewB("");
  };

  const handleAdd = () => {
    if (!name.trim() || !newB.trim()) return;
    onAdd({
      name: name.trim(),
      trigger: trigger.trim(),
      oldBehavior: oldB.trim(),
      newBehavior: newB.trim(),
    });
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <TouchableOpacity
        style={[styles.ghostBtn, { marginBottom: 16 }]}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.ghostText}>+ Add an atomic</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      <Kicker>NEW ATOMIC (JOINS THE QUEUE)</Kicker>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Short name (e.g. DEEP WORK BLOCK)"
          placeholderTextColor={C.faint}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="When… (the trigger moment)"
          placeholderTextColor={C.faint}
          value={trigger}
          onChangeText={setTrigger}
        />
        <TextInput
          style={styles.input}
          placeholder="Instead of… (old default)"
          placeholderTextColor={C.faint}
          value={oldB}
          onChangeText={setOldB}
        />
        <TextInput
          style={styles.input}
          placeholder="→ Do… (the new move)"
          placeholderTextColor={C.faint}
          value={newB}
          onChangeText={setNewB}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.solidBtn} onPress={handleAdd}>
            <Text style={styles.solidText}>Add to queue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => {
              reset();
              setOpen(false);
            }}
          >
            <Text style={styles.ghostText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 11, gap: 9 },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    color: C.text,
    fontSize: 13.5,
  },
  btnRow: { flexDirection: "row", gap: 9 },
  solidBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
  },
  solidText: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 12,
    color: C.bg,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  ghostText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: C.muted,
    letterSpacing: 0.3,
  },
});
