import fs from "node:fs";
import type { KarabinerRules } from "./types";
import { app, createHyperSubLayers, rectangle } from "./utils";

const rules: KarabinerRules[] = [
	// Define the Hyper key itself
	{
		description: "Hyper layer",
		manipulators: [
			{
				description: "; -> Hyper Key",
				from: {
					key_code: "semicolon",
				},
				to: [
					{
						set_variable: {
							name: "hyper",
							value: 1,
						},
					},
				],
				to_after_key_up: [
					{
						set_variable: {
							name: "hyper",
							value: 0,
						},
					},
				],
				to_if_alone: [
					{
						key_code: "semicolon",
					},
				],
				type: "basic",
			},
			// {
			//   type: "basic",
			//   description: "Disable CMD + Tab to force App Key usage",
			//   from: {
			//     key_code: "tab",
			//     modifiers: {
			//       mandatory: ["left_command"],
			//     },
			//   },
			//   to: [
			//     {
			//       key_code: "tab",
			//     },
			//   ],
			// },
		],
	},

	{
		description: "Caps Lock to Ctrl when held, Escape when tapped alone",
		manipulators: [
			{
				from: {
					key_code: "caps_lock",
					modifiers: {
						optional: ["any"],
					},
				},
				to: [
					{
						key_code: "left_control",
					},
				],
				to_if_alone: [
					{
						key_code: "escape",
					},
				],
				type: "basic",
			},
		],
	},

	{
		description: "Double left shift to Caps Lock",
		manipulators: [
			{
				type: "basic",
				from: {
					key_code: "left_shift",
					modifiers: {
						optional: ["any"],
					},
				},
				to: [
					{
						key_code: "caps_lock",
					},
				],
				conditions: [
					{
						type: "variable_if",
						name: "left_shift pressed",
						value: 1,
					},
				],
			},
			{
				type: "basic",
				from: {
					key_code: "left_shift",
					modifiers: {
						optional: ["any"],
					},
				},
				to: [
					{
						set_variable: {
							name: "left_shift pressed",
							value: 1,
						},
					},
					{
						key_code: "left_shift",
					},
				],
				to_delayed_action: {
					to_if_invoked: [
						{
							set_variable: {
								name: "left_shift pressed",
								value: 0,
							},
						},
					],
					to_if_canceled: [
						{
							set_variable: {
								name: "left_shift pressed",
								value: 0,
							},
						},
					],
				},
				parameters: {
					"basic.to_delayed_action_delay_milliseconds": 300,
				},
			},
		],
	},

	...createHyperSubLayers({
		// a = Applications
		a: {
			h: app("Ghostty"),
			j: app("Arc"),
			k: app("Visual Studio Code"),
			l: app("Spotify"),
			r: app("Reminders"),
			c: app("Calendar"),
			f: app("Finder"),
			s: app("System Settings"),
			b: app("Bitwarden"),
		},

		// d = "Display" via rectangle.app
		d: {
			y: rectangle("previous-display"),
			o: rectangle("next-display"),
			k: rectangle("top-half"),
			j: rectangle("bottom-half"),
			h: rectangle("left-half"),
			l: rectangle("right-half"),
			f: rectangle("maximize"),
			u: {
				description: "Window: Previous Tab",
				to: [
					{
						key_code: "tab",
						modifiers: ["right_control", "right_shift"],
					},
				],
			},
			i: {
				description: "Window: Next Tab",
				to: [
					{
						key_code: "tab",
						modifiers: ["right_control"],
					},
				],
			},
			n: {
				description: "Window: Next Window",
				to: [
					{
						key_code: "grave_accent_and_tilde",
						modifiers: ["right_command"],
					},
				],
			},
			b: {
				description: "Window: Back",
				to: [
					{
						key_code: "open_bracket",
						modifiers: ["right_command"],
					},
				],
			},
			// Note: No literal connection. Both f and n are already taken.
			m: {
				description: "Window: Forward",
				to: [
					{
						key_code: "close_bracket",
						modifiers: ["right_command"],
					},
				],
			},
		},

		// s = "System"
		s: {
			u: {
				to: [
					{
						key_code: "volume_increment",
					},
				],
			},
			j: {
				to: [
					{
						key_code: "volume_decrement",
					},
				],
			},
			i: {
				to: [
					{
						key_code: "display_brightness_increment",
					},
				],
			},
			k: {
				to: [
					{
						key_code: "display_brightness_decrement",
					},
				],
			},
			l: {
				to: [
					{
						key_code: "q",
						modifiers: ["right_control", "right_command"],
					},
				],
			},
		},

		// v = "moVe" which isn't "m" because we want it to be on the left hand
		// so that hjkl work like they do in vim
		v: {
			h: {
				to: [{ key_code: "left_arrow" }],
			},
			j: {
				to: [{ key_code: "down_arrow" }],
			},
			k: {
				to: [{ key_code: "up_arrow" }],
			},
			l: {
				to: [{ key_code: "right_arrow" }],
			},
			// Magicmove via homerow.app
			m: {
				to: [{ key_code: "f", modifiers: ["right_control"] }],
				// TODO: Trigger Vim Easymotion when VSCode is focused
			},
			// Scroll mode via homerow.app
			s: {
				to: [{ key_code: "j", modifiers: ["right_control"] }],
			},
			d: {
				to: [{ key_code: "d", modifiers: ["right_shift", "right_command"] }],
			},
			u: {
				to: [{ key_code: "page_down" }],
			},
			i: {
				to: [{ key_code: "page_up" }],
			},
		},

		// c = Musi*c* which isn't "m" because we want it to be on the left hand
		c: {
			k: {
				to: [{ key_code: "play_or_pause" }],
			},
			l: {
				to: [{ key_code: "fastforward" }],
			},
			j: {
				to: [{ key_code: "rewind" }],
			},
		},
	}),
];

fs.writeFileSync(
	"karabiner.json",
	JSON.stringify(
		{
			global: {
				show_in_menu_bar: false,
			},
			profiles: [
				{
					name: "Default",
					complex_modifications: {
						rules,
					},
				},
			],
		},
		null,
		2,
	),
);
