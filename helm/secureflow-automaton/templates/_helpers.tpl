{{/*
Expand the name of the chart.
*/}}
{{- define "secureflow-automaton.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "secureflow-automaton.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "secureflow-automaton.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "secureflow-automaton.labels" -}}
helm.sh/chart: {{ include "secureflow-automaton.chart" . }}
{{ include "secureflow-automaton.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "secureflow-automaton.selectorLabels" -}}
app.kubernetes.io/name: {{ include "secureflow-automaton.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "secureflow-automaton.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "secureflow-automaton.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
PostgreSQL fullname
*/}}
{{- define "secureflow-automaton.postgresql.fullname" -}}
{{- printf "%s-postgresql" (include "secureflow-automaton.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
PostgreSQL secret name
*/}}
{{- define "secureflow-automaton.postgresql.secretName" -}}
{{- if .Values.postgresql.auth.existingSecret }}
{{- .Values.postgresql.auth.existingSecret }}
{{- else }}
{{- include "secureflow-automaton.postgresql.fullname" . }}
{{- end }}
{{- end }}

{{/*
Redis fullname
*/}}
{{- define "secureflow-automaton.redis.fullname" -}}
{{- printf "%s-redis" (include "secureflow-automaton.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Redis secret name
*/}}
{{- define "secureflow-automaton.redis.secretName" -}}
{{- if .Values.redis.auth.existingSecret }}
{{- .Values.redis.auth.existingSecret }}
{{- else }}
{{- include "secureflow-automaton.redis.fullname" . }}
{{- end }}
{{- end }}
