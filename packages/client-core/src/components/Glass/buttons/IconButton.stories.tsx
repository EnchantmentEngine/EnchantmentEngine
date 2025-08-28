import { ChevronLeftMd, ShoppingBag03Lg } from '@ir-engine/ui/src/icons'
import React from 'react'

import { Expand06Md as FullscreenIcon } from '@ir-engine/ui/src/icons'

import {
  ChevronLeftMd as ArrowLeftIcon,
  ChevronRightMd as ArrowRightIcon,
  CheckLg as CheckIcon
} from '@ir-engine/ui/src/icons'
import { FaCartShopping as CartIcon } from 'react-icons/fa6'
import { HiSpeakerXMark as VolumeOffIcon, HiSpeakerWave as VolumeOnIcon } from 'react-icons/hi2'

import type { Meta, StoryObj } from '@storybook/react'

import { distanceVariant, fadeVariant } from './Button.styles'
import { IconButton as Component, Variants } from './IconButton'

const meta: Meta<typeof Component> = {
  title: 'Components/Buttons/IconButton',
  component: Component,
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}
export default meta

type Story = StoryObj<typeof meta>

export const Large: Story = {
  args: {
    size: 'large' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <ShoppingBag03Lg />
  }
}

export const Small: Story = {
  args: {
    size: 'small' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <ChevronLeftMd />
  }
}

export const Fullscreen: Story = {
  args: {
    size: 'large' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <FullscreenIcon />
  }
}

export const ShoppingCart: Story = {
  args: {
    size: 'large' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <CartIcon />,
    className: `text-2xl`
  }
}

export const VolumeOff: Story = {
  args: {
    size: 'large' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <VolumeOffIcon />
  }
}

export const VolumeOn: Story = {
  args: {
    size: 'large' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <VolumeOnIcon />
  }
}

export const Back: Story = {
  args: {
    size: 'small' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <ArrowLeftIcon />
  }
}

export const PrevPage: Story = {
  args: {
    size: 'small' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <ArrowLeftIcon />
  }
}

export const NextPage: Story = {
  args: {
    size: 'small' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <ArrowRightIcon />
  }
}

export const Check: Story = {
  args: {
    size: 'small' as Variants['size'],
    distance: 'low' as keyof typeof distanceVariant,
    fade: `light` as keyof typeof fadeVariant,
    children: <CheckIcon />
  }
}
