import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          Mind Signal ran into an unexpected error. Please restart the app.
        </Text>
        <Text style={styles.crisis}>
          If you are in crisis, call Samaritans free on{'\n'}
          <Text style={styles.phone}>116 123</Text> (24/7)
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => this.setState({ hasError: false, message: '' })}
        >
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F7F3FF', padding: 32,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  body: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  crisis: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    textAlign: 'center', fontSize: 14, color: '#555',
    lineHeight: 22, marginBottom: 28, borderLeftWidth: 3, borderLeftColor: '#5B2D8E',
  },
  phone: { fontWeight: '700', color: '#5B2D8E', fontSize: 18 },
  btn: {
    backgroundColor: '#5B2D8E', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
