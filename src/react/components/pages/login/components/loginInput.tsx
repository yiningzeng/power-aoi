import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import AccountCircle from "@material-ui/icons/AccountCircle";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import React from "react";
import {red} from "@material-ui/core/colors";
import {IconButton} from "@material-ui/core";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import clsx from "clsx";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            flexWrap: "wrap",
        },
        margin: {
            margin: theme.spacing(1),
        },
        withoutLabel: {
            marginTop: theme.spacing(3),
        },
        icon: {
          marginBottom: theme.spacing(2),
        },
        textField: {
            width: 200,
        },
    }),
);

interface IState {
    value: string;
    showPassword: boolean;
}

export default function LoginInput(props) {
    const [values, setValues] = React.useState<IState>({
        value: "",
        showPassword: false,
    });
    const classes = useStyles(props);

    const handleClickShowPassword = () => {
        setValues({...values, showPassword: !values.showPassword});
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return <div>
        <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
                <Grid item className={classes.icon}>
                    {
                        props.password === undefined ? <AccountCircle/> : <VpnKeyIcon/>
                    }
                </Grid>
                <Grid item>
                    <FormControl className={clsx(classes.margin, classes.textField)}>
                        <InputLabel htmlFor="standard-adornment-password">{props.label}</InputLabel>
                        <Input id="input-with-icon-grid"
                               onChange={(v) => props.onChange(v)}
                               type={props.password === undefined ? "text" :
                                   values.showPassword ? "text" : "password"}
                               endAdornment={
                                   props.password !== undefined &&
                                   <InputAdornment position="end">
                                       <IconButton
                                           aria-label="toggle password visibility"
                                           onClick={handleClickShowPassword}
                                           onMouseDown={handleMouseDownPassword}
                                       >
                                           {values.showPassword ? <Visibility/> : <VisibilityOff/>}
                                       </IconButton>
                                   </InputAdornment>
                               }/>
                    </FormControl>
                </Grid>
            </Grid>
        </div>
    </div>;
}
