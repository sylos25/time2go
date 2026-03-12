"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import { Button } from "./button"

type AlertDialogProps = React.ComponentProps<typeof Dialog>
type AlertDialogContentProps = React.ComponentProps<typeof DialogContent>
type AlertDialogHeaderProps = React.ComponentProps<typeof DialogHeader>
type AlertDialogFooterProps = React.ComponentProps<typeof DialogFooter>
type AlertDialogTitleProps = React.ComponentProps<typeof DialogTitle>
type AlertDialogDescriptionProps = React.ComponentProps<typeof DialogDescription>
type AlertDialogTriggerProps = React.ComponentProps<typeof DialogTrigger>
type AlertDialogButtonProps = React.ComponentProps<typeof Button>

function AlertDialog(props: AlertDialogProps) {
  return <Dialog {...props} />
}

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <DialogTrigger {...props} />
}

function AlertDialogContent(props: AlertDialogContentProps) {
  return <DialogContent {...props} />
}

function AlertDialogHeader(props: AlertDialogHeaderProps) {
  return <DialogHeader {...props} />
}

function AlertDialogFooter(props: AlertDialogFooterProps) {
  return <DialogFooter {...props} />
}

function AlertDialogTitle(props: AlertDialogTitleProps) {
  return <DialogTitle {...props} />
}

function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  return <DialogDescription {...props} />
}

function AlertDialogAction(props: AlertDialogButtonProps) {
  return <Button {...props} />
}

function AlertDialogCancel(props: AlertDialogButtonProps) {
  return <Button variant="outline" {...props} />
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}

